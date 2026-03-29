import { getAllUserPoints } from "../utils/qdrant.js";
import { kMeansClustering } from "../utils/kmeans.js";

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
    if (array.length === 0) return "Article";
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

        // 1. Separation for items requiring K-Means vs Deterministic folders
        const itemsToCluster = [];
        const deterministicClusters = new Map(); // For Domain, Media, and Tag-based folders

        for (const point of points) {
            if (!point.payload) continue;
            
            const data = point.payload;
            const url = (data.url || "").toLowerCase();
            const tags = data.tags || [];
            const st = (data.sourceType || "").toLowerCase();
            const t = (data.title || "").toLowerCase();
            const u = (data.url || "").toLowerCase();

            let category = null;

            // A. Domain specific checks
            if (u.includes("youtube.com") || u.includes("youtu.be")) {
                category = "YouTube";
            } else if (u.includes("twitter.com") || u.includes("x.com")) {
                category = "X (Twitter)";
            } else if (u.includes("google.com") || u.includes("google.co")) {
                category = "Google";
            } else if (u.includes("instagram.com")) {
                category = "Instagram";
            } else if (u.includes("linkedin.com")) {
                category = "LinkedIn";
            }
            // B. Media specific checks
            else if (st === "image" || t.endsWith(".jpg") || t.endsWith(".jpeg") || t.endsWith(".png") || t.endsWith(".webp")) {
                category = "Images";
            } else if (st === "video" || t.endsWith(".mp4") || t.endsWith(".mov") || t.endsWith(".avi")) {
                category = "Videos";
            } else if (st === "pdf" || t.endsWith(".pdf") || u.endsWith(".pdf")) {
                category = "PDF Documents";
            }
            // C. Tag-based Topic checks (RESTORED logic)
            else {
                const meaningfulTags = tags.filter(tag => {
                    const lt = tag.toLowerCase();
                    return !["article", "link", "pdf", "image", "video", "tutorial"].includes(lt);
                });

                if (meaningfulTags.length > 0) {
                    category = meaningfulTags[0]; // first meaningful tag defines the folder
                }
            }

            const itemPayload = {
                _id: data.mongodbId || point.id,
                url: data.url,
                title: data.title || "Untitled Document",
                tags: data.tags || [],
                description: data.description || "",
                type: data.sourceType?.toLowerCase() === "article" ? "url" : data.url ? "url" : "pdf",
                sourceType: data.sourceType,
                vector: point.vector
            };

            if (category) {
                const norm = category.toLowerCase();
                if (!deterministicClusters.has(norm)) {
                    deterministicClusters.set(norm, { name: category, items: [] });
                }
                deterministicClusters.get(norm).items.push(itemPayload);
            } else {
                // Truly miscellaneous items (no domain, no specific topic tags)
                itemsToCluster.push(itemPayload);
            }
        }

        // 2. Perform Topic Clustering only for the leftover items
        const topicClusters = [];
        if (itemsToCluster.length > 0) {
            const k = Math.min(5, Math.ceil(itemsToCluster.length / 8));
            const clusters = kMeansClustering(itemsToCluster, k);

            clusters.forEach((cluster, idx) => {
                const tagRanks = {};
                for (const p of cluster.points) {
                    for (const tag of p.tags) {
                        tagRanks[tag] = (tagRanks[tag] || 0) + 1;
                    }
                }
                
                const topTags = Object.keys(tagRanks).sort((a,b) => tagRanks[b] - tagRanks[a]);
                const cloudName = topTags[0] || `Article ${idx + 1}`;
                
                topicClusters.push({
                    name: cloudName,
                    items: cluster.points
                });
            });
        }

        // 3. Assemble and sort groups
        const finalClusters = [
            ...Array.from(deterministicClusters.values()),
            ...topicClusters
        ].map((c, index) => ({
            id: `cluster_${index}`,
            name: c.name,
            itemCount: c.items.length,
            items: c.items
        })).sort((a, b) => b.itemCount - a.itemCount);

        return res.status(200).json({ clusters: finalClusters });

    } catch (error) {
        console.error("Clustering error:", error);
        return res.status(500).json({ message: "Failed to generate clusters." });
    }
};
