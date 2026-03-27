import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Scrapes a URL and extracts its title, description, and main text content.
 * @param {string} url - The URL to scrape
 * @returns {Object} - { title, description, content }
 */
export const extractUrlContent = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            timeout: 10000, // 10 seconds timeout
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract Title
        let title = $("head > title").text().trim();
        if (!title) {
            title = $("meta[property='og:title']").attr("content") || "";
        }

        // Extract Description
        let description = $("meta[name='description']").attr("content") || "";
        if (!description) {
            description = $("meta[property='og:description']").attr("content") || "";
        }

        // Extract Main Content
        // We want to avoid scraping nav, footer, script, styles, etc.
        $("script, style, noscript, nav, footer, header, aside").remove();
        
        let content = $("article").text().trim();
        if (!content) {
            content = $("body").text().trim();
        }

        // Clean up excessive whitespaces and newlines
        content = content.replace(/\s+/g, " ").trim();
        
        // Limit content length so we don't blow up the DB
        if (content.length > 10000) {
            content = content.substring(0, 10000) + "...";
        }

        return {
            title,
            description,
            content,
        };
    } catch (error) {
        console.error("Error scraping URL:", url, error.message);
        // We don't want to fail saving the item just because scraping failed
        return {
            title: "",
            description: "",
            content: "",
        };
    }
};
