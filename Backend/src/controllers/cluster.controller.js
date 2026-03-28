import { getAllUserPoints } from "../utils/qdrant.js";

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

export const getClusters = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        // Fetch all semantic vectors and embedded details
        const points = await getAllUserPoints(userId);

        if (!points || points.length === 0) {
            return res.status(200).json({ clusters: [] });
        }

        // Hardcoded distinction groups based on user request + AI Topic fallback
        const categoryMap = new Map();

        for (const point of points) {
            if (!point.payload) continue;
            
            const data = point.payload;
            const url = (data.url || "").toLowerCase();
            const tags = data.tags || [];
            
            let category = "Miscellaneous";
            
            // 1. Explicit domain routing
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                category = "YouTube";
            } else if (url.includes("twitter.com") || url.includes("x.com")) {
                category = "X (Twitter)";
            } else if (url.includes("google.com") || url.includes("google.co")) {
                category = "Google";
            } else if (url.includes("instagram.com")) {
                category = "Instagram";
            } else if (url.includes("linkedin.com")) {
                category = "LinkedIn";
            } else {
                // 2. High-level topic routing via AI tags (React, AI, etc.)
                // Filter out non-descriptive media types so we grab actual topics
                const meaningfulTags = tags.filter(t => {
                    const lt = t.toLowerCase();
                    return lt !== "article" && lt !== "tutorial" && lt !== "video" && lt !== "pdf" && lt !== "link";
                });
                
                if (meaningfulTags.length > 0) {
                    category = meaningfulTags[0]; // grab the highest confidence topic tag
                } else if (data.title) {
                    category = data.title.split(" ")[0]; // fallback to first word of title
                }
            }

            const normalizedCategory = category.toLowerCase();
            
            if (!categoryMap.has(normalizedCategory)) {
                categoryMap.set(normalizedCategory, {
                    name: category,
                    items: []
                });
            }
            
            categoryMap.get(normalizedCategory).items.push({
                _id: data.mongodbId || point.id, // Fallback to Qdrant ID if missing
                url: data.url,
                title: data.title || "Untitled Document",
                tags: data.tags || [],
                description: data.description || "",
                type: data.sourceType?.toLowerCase() === "article" ? "url" : data.url ? "url" : "pdf",
                sourceType: data.sourceType
            });
        }

        // Output formatting
        const finalClusters = Array.from(categoryMap.values()).map((c, index) => {
            return {
                id: `cluster_${index}`,
                name: c.name,
                itemCount: c.items.length,
                items: c.items
            };
        });

        // Group size sorting (largest folders first)
        finalClusters.sort((a, b) => b.items.length - a.items.length);

        return res.status(200).json({ clusters: finalClusters });

    } catch (error) {
        console.error("Clustering error:", error);
        return res.status(500).json({ message: "Failed to generate clusters dynamically." });
    }
};
