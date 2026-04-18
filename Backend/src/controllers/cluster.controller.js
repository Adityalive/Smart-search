import { getAllUserPoints } from "../utils/qdrant.js";
import { kMeansClustering } from "../utils/kmeans.js";
import Item from "../models/item.model.js";


// Helper: Dot product divided by magnitudes
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper: find most frequent string in array
function getMostFrequent(array) {
    if (array.length === 0) return "Miscellaneous";
    const counts = {};
    let maxCount = 0;
    let mostFrequent = array[0];
    for (const item of array) {
        counts[item] = (counts[item] || 0) + 1;
        if (counts[item] > maxCount) {
            maxCount = counts[item];
            mostFrequent = item;
        }
    }
    return mostFrequent;
}

// ─── Comprehensive Domain → Folder Map ───────────────────────────────────────
const DOMAIN_MAP = [
    // === Coding & DSA ===
    { match: ["leetcode.com"],                             folder: "LeetCode" },
    { match: ["codeforces.com"],                           folder: "Codeforces" },
    { match: ["hackerrank.com"],                           folder: "HackerRank" },
    { match: ["codechef.com"],                             folder: "CodeChef" },
    { match: ["geeksforgeeks.org"],                        folder: "GeeksForGeeks" },
    { match: ["neetcode.io"],                              folder: "NeetCode" },
    { match: ["atcoder.jp"],                               folder: "AtCoder" },
    { match: ["cses.fi"],                                  folder: "CSES" },
    { match: ["interviewbit.com"],                         folder: "InterviewBit" },
    // === Developer Tools & Docs ===
    { match: ["github.com", "github.io"],                  folder: "GitHub" },
    { match: ["gitlab.com"],                               folder: "GitLab" },
    { match: ["bitbucket.org"],                            folder: "Bitbucket" },
    { match: ["stackoverflow.com"],                        folder: "Stack Overflow" },
    { match: ["developer.mozilla.org", "mdn.io"],          folder: "MDN Docs" },
    { match: ["docs.python.org"],                          folder: "Python Docs" },
    { match: ["npmjs.com"],                                folder: "npm" },
    { match: ["pypi.org"],                                 folder: "PyPI" },
    { match: ["replit.com"],                               folder: "Replit" },
    { match: ["codesandbox.io"],                           folder: "CodeSandbox" },
    { match: ["codepen.io"],                               folder: "CodePen" },
    { match: ["jsfiddle.net"],                             folder: "JSFiddle" },
    // === Articles & Blogs ===
    { match: ["medium.com"],                               folder: "Medium" },
    { match: ["dev.to"],                                   folder: "Dev.to" },
    { match: ["hashnode.com", "hashnode.dev"],              folder: "Hashnode" },
    { match: ["substack.com"],                             folder: "Substack" },
    { match: ["ghost.io"],                                 folder: "Ghost Blog" },
    { match: ["wordpress.com"],                            folder: "WordPress" },
    { match: ["blogger.com"],                              folder: "Blogger" },
    // === Big Tech & Social ===
    { match: ["youtube.com", "youtu.be"],                  folder: "YouTube" },
    { match: ["twitter.com", "x.com"],                     folder: "X (Twitter)" },
    { match: ["linkedin.com"],                             folder: "LinkedIn" },
    { match: ["instagram.com"],                            folder: "Instagram" },
    { match: ["facebook.com", "fb.com", "fb.watch"],       folder: "Facebook" },
    { match: ["reddit.com"],                               folder: "Reddit" },
    { match: ["discord.com", "discordapp.com"],            folder: "Discord" },
    { match: ["slack.com"],                                folder: "Slack" },
    { match: ["telegram.org", "t.me"],                     folder: "Telegram" },
    { match: ["whatsapp.com"],                             folder: "WhatsApp" },
    // === Companies & Products ===
    { match: ["google.com", "google.co"],                  folder: "Google" },
    { match: ["amazon.com", "amzn.to"],                    folder: "Amazon" },
    { match: ["apple.com"],                                folder: "Apple" },
    { match: ["microsoft.com", "msft.com"],                folder: "Microsoft" },
    { match: ["netflix.com"],                              folder: "Netflix" },
    { match: ["spotify.com"],                              folder: "Spotify" },
    { match: ["notion.so"],                                folder: "Notion" },
    { match: ["figma.com"],                                folder: "Figma" },
    { match: ["canva.com"],                                folder: "Canva" },
    { match: ["trello.com"],                               folder: "Trello" },
    { match: ["jira.atlassian.net", "atlassian.com"],      folder: "Atlassian" },
    { match: ["airtable.com"],                             folder: "Airtable" },
    { match: ["dropbox.com"],                              folder: "Dropbox" },
    { match: ["drive.google.com"],                         folder: "Google Drive" },
    { match: ["docs.google.com"],                          folder: "Google Docs" },
    // === Cloud & DevOps ===
    { match: ["vercel.com"],                               folder: "Vercel" },
    { match: ["render.com"],                               folder: "Render" },
    { match: ["aws.amazon.com", "amazonaws.com"],          folder: "AWS" },
    { match: ["cloud.google.com"],                         folder: "Google Cloud" },
    { match: ["azure.microsoft.com"],                      folder: "Azure" },
    { match: ["cloudflare.com"],                           folder: "Cloudflare" },
    { match: ["digitalocean.com"],                         folder: "DigitalOcean" },
    { match: ["heroku.com"],                               folder: "Heroku" },
    { match: ["railway.app"],                              folder: "Railway" },
    // === Frontend / Framework Docs ===
    { match: ["tailwindcss.com"],                          folder: "Tailwind CSS" },
    { match: ["reactjs.org", "react.dev"],                 folder: "React Docs" },
    { match: ["vuejs.org"],                                folder: "Vue Docs" },
    { match: ["nextjs.org"],                               folder: "Next.js Docs" },
    { match: ["angular.io"],                               folder: "Angular Docs" },
    { match: ["svelte.dev"],                               folder: "Svelte Docs" },
    { match: ["vitejs.dev"],                               folder: "Vite Docs" },
    // === Learning Platforms ===
    { match: ["coursera.org"],                             folder: "Coursera" },
    { match: ["udemy.com"],                                folder: "Udemy" },
    { match: ["khanacademy.org"],                          folder: "Khan Academy" },
    { match: ["edx.org"],                                  folder: "edX" },
    { match: ["freecodecamp.org"],                         folder: "freeCodeCamp" },
    { match: ["w3schools.com"],                            folder: "W3Schools" },
    { match: ["brilliant.org"],                            folder: "Brilliant" },
    // === Research & Knowledge ===
    { match: ["wikipedia.org"],                            folder: "Wikipedia" },
    { match: ["arxiv.org"],                                folder: "arXiv Papers" },
    { match: ["scholar.google.com"],                       folder: "Google Scholar" },
    { match: ["pubmed.ncbi.nlm.nih.gov"],                  folder: "PubMed" },
    // === News ===
    { match: ["techcrunch.com"],                           folder: "TechCrunch" },
    { match: ["theverge.com"],                             folder: "The Verge" },
    { match: ["wired.com"],                                folder: "Wired" },
    { match: ["bbc.com", "bbc.co.uk"],                     folder: "BBC" },
    { match: ["cnn.com"],                                  folder: "CNN" },
    { match: ["hnews.ycombinator.com", "news.ycombinator.com"], folder: "Hacker News" },
];

function getDomainFolder(url) {
    const u = url.toLowerCase();
    for (const { match, folder } of DOMAIN_MAP) {
        if (match.some(domain => u.includes(domain))) {
            return folder;
        }
    }
    return null;
}

export const getClusters = async (req, res) => {
    try {
        const userId = req.user.id.toString();

        // ── 1. Primary source: ALL items from MongoDB ──────────────────────────
        const allItems = await Item.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();

        if (!allItems || allItems.length === 0) {
            return res.status(200).json({ clusters: [] });
        }

        // ── 2. Build a Qdrant vector map for items that have embeddings ─────────
        //    (used only for k-means on uncategorized items)
        let vectorMap = new Map(); // mongodbId → vector
        try {
            const points = await getAllUserPoints(userId);
            for (const point of points) {
                if (point.payload?.mongodbId && point.vector?.length > 0) {
                    vectorMap.set(point.payload.mongodbId, point.vector);
                }
            }
        } catch (e) {
            console.error("[Clusters] Qdrant fetch failed (continuing with domain clusters):", e.message);
        }

        // ── 3. Classify every MongoDB item ────────────────────────────────────
        const deterministicClusters = new Map(); // folderName → { name, items[] }
        const itemsForKMeans = [];

        for (const item of allItems) {
            const url = item.url || "";
            const st = (item.sourceType || "").toLowerCase();
            const idStr = item._id.toString();

            const itemPayload = {
                _id: idStr,
                url: item.url,
                title: item.title || "Untitled",
                tags: item.tags || [],
                description: item.description || "",
                type: item.type || "url",
                sourceType: item.sourceType,
                image: item.image,
                siteName: item.siteName,
                favicon: item.favicon,
                createdAt: item.createdAt,
            };

            let category = null;

            // a) Domain map (most specific)
            if (url) category = getDomainFolder(url);

            // b) Media type (only if no domain match)
            if (!category) {
                if (st === "image") category = "Images";
                else if (st === "video") category = "Videos";
                else if (st === "pdf") category = "PDF Documents";
            }

            if (category) {
                const norm = category.toLowerCase();
                if (!deterministicClusters.has(norm)) {
                    deterministicClusters.set(norm, { name: category, items: [] });
                }
                deterministicClusters.get(norm).items.push(itemPayload);
            } else {
                // No domain/media match — try k-means if we have a vector
                const vec = vectorMap.get(idStr);
                if (vec) {
                    itemsForKMeans.push({ ...itemPayload, vector: vec });
                } else {
                    // No vector either — put in a generic "Other" bucket
                    const norm = "other";
                    if (!deterministicClusters.has(norm)) {
                        deterministicClusters.set(norm, { name: "Other", items: [] });
                    }
                    deterministicClusters.get(norm).items.push(itemPayload);
                }
            }
        }

        // ── 4. K-means on items with embeddings but no known domain ───────────
        const topicClusters = [];
        if (itemsForKMeans.length > 0) {
            const k = Math.max(2, Math.min(5, Math.ceil(itemsForKMeans.length / 3)));
            const clusters = kMeansClustering(itemsForKMeans, k);

            clusters.forEach((cluster, idx) => {
                const tagRanks = {};
                for (const p of cluster.points) {
                    for (const tag of (p.tags || [])) {
                        tagRanks[tag] = (tagRanks[tag] || 0) + 1;
                    }
                }
                const topTags = Object.keys(tagRanks).sort((a, b) => tagRanks[b] - tagRanks[a]);
                const clusterName = topTags[0] || `Topic ${idx + 1}`;

                // Strip vector from output — frontend doesn't need it
                topicClusters.push({
                    name: clusterName,
                    items: cluster.points.map(({ vector, ...rest }) => rest),
                });
            });
        }

        // ── 5. Merge and sort by size ─────────────────────────────────────────
        const finalClusters = [
            ...Array.from(deterministicClusters.values()),
            ...topicClusters,
        ]
            .filter(c => c.items.length > 0)
            .map((c, index) => ({
                id: `cluster_${index}`,
                name: c.name,
                itemCount: c.items.length,
                items: c.items,
            }))
            .sort((a, b) => b.itemCount - a.itemCount);

        return res.status(200).json({ clusters: finalClusters });

    } catch (error) {
        console.error("Clustering error:", error);
        return res.status(500).json({ message: "Failed to generate clusters." });
    }
};

