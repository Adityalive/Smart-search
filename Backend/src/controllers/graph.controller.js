import { getAllUserPoints, recommendSimilar, searchSimilar } from "../utils/qdrant.js";
import { getEmbedding } from "../utils/embeddings.js";

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

// Map a qdrant payload into our standard item format
const mapPayloadToItem = (payload, id) => {
    return {
        _id: payload.mongodbId || id,
        url: payload.url,
        title: payload.title || "Untitled Document",
        tags: payload.tags || [],
        description: payload.description || "",
        type: payload.sourceType?.toLowerCase() === "article" ? "url" : payload.url ? "url" : "pdf",
        sourceType: payload.sourceType
    };
};

// GET /api/items/graph — Get all nodes and similarity edges
export const getGraph = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const points = await getAllUserPoints(userId);

        if (!points || points.length === 0) {
            return res.status(200).json({ nodes: [], links: [] });
        }

        const nodes = [];
        const links = [];
        const SIMILARITY_THRESHOLD = 0.65; // High semantic overlap threshold for graph linkage

        // 1. Create nodes
        points.forEach(point => {
            if (point.payload && point.vector && point.vector.length > 0) {
                const item = mapPayloadToItem(point.payload, point.id);
                // Assign a primary group/color identifier (like the first semantic tag)
                const group = (point.payload.tags && point.payload.tags.length > 0) 
                    ? point.payload.tags[0] 
                    : "Miscellaneous";
                
                nodes.push({
                    id: item._id,
                    name: item.title,
                    val: 1, // Node size
                    group: group,
                    ...item
                });
            }
        });

        // 2. Create optimized O(n^2) edges
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (!points[i].vector || !points[j].vector || !points[i].payload || !points[j].payload) continue;

                const similarity = cosineSimilarity(points[i].vector, points[j].vector);
                if (similarity >= SIMILARITY_THRESHOLD) {
                    links.push({
                        source: points[i].payload.mongodbId || points[i].id,
                        target: points[j].payload.mongodbId || points[j].id,
                        value: similarity // Used for link visual strength
                    });
                }
            }
        }

        return res.status(200).json({ nodes, links });
    } catch (error) {
        console.error("Knowledge Graph error:", error);
        return res.status(500).json({ message: "Failed to generate graph dynamically." });
    }
};

// GET /api/items/:id/related — Get conceptually similar items for a specific document
export const getRelatedItems = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const { id } = req.params;

        // Ask Qdrant for the closest 5 geometrically neighboring clusters
        const recommendations = await recommendSimilar(id, userId, 5);

        const items = recommendations.map(rec => ({
            ...mapPayloadToItem(rec.payload, rec.id),
            score: rec.score // Include similarity match percentage purely for UI debugging if we want
        }));

        return res.status(200).json({ items });
    } catch (error) {
        console.error("Related Items error:", error);
        return res.status(500).json({ message: "Failed to fetch related semantic items." });
    }
};

// GET /api/items/search?q="..." — Execute pure AI Semantic Search
export const semanticSearch = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const query = req.query.q;

        if (!query) {
             return res.status(400).json({ message: "Search query required." });
        }

        // Generate vector embedding for the string typed by the user!
        const queryVector = await getEmbedding(query);

        if (!queryVector || queryVector.length === 0) {
            return res.status(500).json({ message: "AI Embedding failed for query." });
        }

        // Perform nearest-neighbor similarity search against all stored docs
        const searchResults = await searchSimilar(queryVector, userId, 10);

        const items = searchResults.map(res => ({
             ...mapPayloadToItem(res.payload, res.id),
             score: res.score
        }));

        return res.status(200).json({ items });

    } catch (error) {
        console.error("Semantic Search error:", error);
        return res.status(500).json({ message: "Search vector algorithm failed." });
    }
};
