// backend/services/scraper.js
import axios from "axios";
import puppeteer from "puppeteer";

// ─── Helpers (unchanged from your current code) ───────────────────────────────

const cleanContent = (content) => {
    if (!content) return "";
    return content
        .replace(/\n{3,}/g, "\n\n")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/^https?:\/\/\S+$/gm, "")
        .replace(/^[-*_]{3,}$/gm, "")
        .replace(/^[\s\d\W]{0,5}$/gm, "")
        .replace(/we use cookies.*?\./gi, "")
        .replace(/accept all cookies/gi, "")
        .replace(/privacy policy/gi, "")
        .replace(/^(share|subscribe|follow us|sign up|newsletter).*$/gim, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const extractSmartSlice = (content, maxLength = 8000) => {
    if (content.length <= maxLength) return content;
    const firstChunk = content.slice(0, 4000);
    const middleStart = Math.floor(content.length / 2);
    const middleChunk = content.slice(middleStart, middleStart + 2000);
    const lastChunk = content.slice(-1000);
    return `${firstChunk}\n\n[...]\n\n${middleChunk}\n\n[...]\n\n${lastChunk}`;
};

export const detectSourceType = (url) => {
    const u = url.toLowerCase();
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube Video";
    if (u.includes("twitter.com") || u.includes("x.com")) return "Tweet";
    if (u.includes("github.com")) return "GitHub Repository";
    if (u.includes("arxiv.org") || u.includes("researchgate")) return "Research Paper";
    if (u.includes("medium.com") || u.includes("substack.com")) return "Blog Post";
    if (u.includes("reddit.com")) return "Forum Post";
    if (u.includes("stackoverflow.com")) return "Forum Post";
    if (u.includes("dev.to") || u.includes("hashnode")) return "Blog Post";
    if (u.includes("docs.") || u.includes("/docs/")) return "Documentation";
    if (u.includes("wikipedia.org")) return "Encyclopedia Article";
    return "Article";
};

const buildFallbackDescription = (content) => {
    if (!content) return "";
    const lines = content.split("\n").map(l => l.trim());
    const firstPara = lines.find(
        l => l.length > 60 && !l.startsWith("#") && !l.startsWith("-")
    );
    return firstPara ? firstPara.slice(0, 300) : "";
};

const detectPaywall = (text) =>
    /subscribe to (read|continue)|this content is for (paid|premium)|sign in to read/i
        .test(text.slice(0, 1000));

// ─── Scraper 1: Jina Reader ───────────────────────────────────────────────────

const scrapeWithJina = async (url) => {
    const response = await axios.get(`https://r.jina.ai/${url}`, {
        headers: {
            "Accept": "application/json",
            "X-Return-Format": "markdown",
            "X-Wait-For-Selector": "body",
            "X-Remove-Selector": "nav, footer, header, .sidebar, .ads, .cookie-banner, .newsletter-signup",
            // "Authorization": `Bearer ${process.env.JINA_API_KEY}`,
        },
        timeout: 25000,
    });

    const data = response.data?.data || {};
    return {
        title: (data.title || "").trim(),
        description: (data.description || "").trim(),
        rawContent: data.content || "",
    };
};

// ─── Scraper 2: Puppeteer fallback ────────────────────────────────────────────

const scrapeWithPuppeteer = async (url) => {
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",               // required on Linux servers
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",    // prevents crashes on low-memory servers
                "--disable-gpu",
                "--no-first-run",
                "--no-zygote",
                "--single-process",           // important for deployment environments
            ],
        });

        const page = await browser.newPage();

        // block images, fonts, stylesheets — we only need text, load faster
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            const blocked = ["image", "stylesheet", "font", "media"];
            if (blocked.includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // realistic browser headers — reduces bot detection
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        );

        await page.goto(url, {
            waitUntil: "networkidle2", // wait until no network activity
            timeout: 30000,
        });

        // wait a bit for any lazy-loaded content
        await new Promise(r => setTimeout(r, 1500));

        // extract text directly from the DOM — cleaner than parsing raw HTML
        const extracted = await page.evaluate(() => {
            // remove noise elements before extracting
            const noiseSelectors = [
                "nav", "footer", "header", "aside",
                ".sidebar", ".ads", ".advertisement",
                ".cookie-banner", ".newsletter",
                ".social-share", ".related-posts",
                "script", "style", "noscript",
            ];
            noiseSelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => el.remove());
            });

            // try to find the main content area first
            const mainSelectors = [
                "article",
                "main",
                '[role="main"]',
                ".post-content",
                ".article-body",
                ".entry-content",
                ".content",
            ];

            let mainEl = null;
            for (const sel of mainSelectors) {
                mainEl = document.querySelector(sel);
                if (mainEl) break;
            }

            // fall back to body if no main content found
            const contentEl = mainEl || document.body;

            return {
                title: document.title || "",
                description: document.querySelector('meta[name="description"]')
                    ?.getAttribute("content") || "",
                content: contentEl.innerText || "",
            };
        });

        return extracted;

    } finally {
        // ALWAYS close browser — memory leak if you don't
        if (browser) await browser.close();
    }
};

// ─── Main exported function ───────────────────────────────────────────────────

export const extractUrlContent = async (url) => {
    const sourceType = detectSourceType(url);

    let title = "";
    let description = "";
    let rawContent = "";
    let scrapedBy = "";

    // ── Try Jina first (fast, clean) ──────────────────────────────────────────
    try {
        console.log(`[Scraper] Trying Jina for: ${url}`);
        const jina = await scrapeWithJina(url);
        title = jina.title;
        description = jina.description;
        rawContent = jina.rawContent;
        scrapedBy = "jina";
        console.log(`[Scraper] Jina succeeded ✓`);
    } catch (jinaError) {
        const status = jinaError.response?.status;

        if (status === 429) {
            console.warn(`[Scraper] Jina rate limited — falling back to Puppeteer`);
        } else if (status === 403) {
            console.warn(`[Scraper] Jina blocked (403) — falling back to Puppeteer`);
        } else {
            console.warn(`[Scraper] Jina failed (${jinaError.message}) — falling back to Puppeteer`);
        }

        // ── Puppeteer fallback ───────────────────────────────────────────────────
        try {
            console.log(`[Scraper] Trying Puppeteer for: ${url}`);
            const puppet = await scrapeWithPuppeteer(url);
            title = puppet.title;
            description = puppet.description;
            rawContent = puppet.content;
            scrapedBy = "puppeteer";
            console.log(`[Scraper] Puppeteer succeeded ✓`);
        } catch (puppeteerError) {
            console.error(`[Scraper] Puppeteer also failed: ${puppeteerError.message}`);
            // both failed — return empty safe object
            return {
                title: "",
                description: "",
                content: "",
                sourceType,
                wordCount: 0,
                isPaywalled: false,
                scrapedBy: "failed",
            };
        }
    }

    // ── Post-process the result (same for both scrapers) ──────────────────────

    const cleanedContent = cleanContent(rawContent);

    if (!description && cleanedContent) {
        description = buildFallbackDescription(cleanedContent);
    }

    // fallback title from URL slug
    if (!title) {
        try {
            const pathname = new URL(url).pathname;
            title = pathname
                .split("/")
                .filter(Boolean)
                .pop()
                ?.replace(/[-_]/g, " ")
                ?.replace(/\.\w+$/, "")
                || url;
        } catch {
            title = url;
        }
    }

    const content = extractSmartSlice(cleanedContent);
    const wordCount = cleanedContent.split(/\s+/).filter(Boolean).length;
    const isPaywalled = detectPaywall(cleanedContent);

    if (isPaywalled) {
        console.warn(`[Scraper] Paywalled content detected: ${url}`);
    }

    return {
        title,
        description,
        content,
        sourceType,
        wordCount,
        isPaywalled,
        scrapedBy,    // "jina" or "puppeteer" — useful for debugging
    };
};