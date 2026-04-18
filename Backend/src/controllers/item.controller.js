import { validationResult } from "express-validator";
import Item from "../models/item.model.js";
import { extractPdfContent } from "../services/pdf.js";
import itemQueue from "../queues/itemQueues.js";
import { uploadToImageKit } from "../utils/imagekit.js";
import { getAllUserPoints } from "../utils/qdrant.js";
import { kMeansClustering } from "../utils/kmeans.js";

// POST /api/items — save a new link or upload file
export const saveItem = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        let { url, title, tags, collectionId } = req.body;
        let type = "url";
        let description = "";
        let content = "";

        // If a file was uploaded via Multer (using MemoryStorage)
        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                type = "pdf";
                // We keep PDF extraction sync because the buffer is in-memory and hard to send via redis easily
                content = await extractPdfContent(req.file.buffer);
                title = title || req.file.originalname;
                req.body.sourceType = "PDF";
            } else if (req.file.mimetype.startsWith("image/") || req.file.mimetype.startsWith("video/")) {
                const isVideo = req.file.mimetype.startsWith("video/");
                type = "url"; 
                
                // Upload to ImageKit explicitly
                const remoteUrl = await uploadToImageKit(req.file.buffer, req.file.originalname, req.file.mimetype);
                url = remoteUrl;
                title = title || req.file.originalname;
                
                // Pre-seed sourceType for deterministic clustering
                req.body.sourceType = isVideo ? "Video" : "Image";
            }
        } 
        // If a URL was provided
        else if (url) {
            type = "url";
        } 
        // Neither was provided
        else {
            return res.status(400).json({ message: "Please provide a valid URL or upload a file." });
        }

        // Parse tags if they were sent as a comma-separated string
        if (typeof tags === 'string') {
            tags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }

        const itemData = {
            userId: req.user.id,
            type,
            title,
            description,
            content,
            status: "pending",
            tags: Array.isArray(tags) ? tags : [],
            sourceType: req.body.sourceType // capture explicitly seeded sourceTypes
        };
        
        if (url) itemData.url = url;
        if (collectionId) itemData.collectionId = collectionId;

        const item = await Item.create(itemData);

        // Add to background processing queue (for scraping URLs, or doing AI Tagging/Embedding for both)
        try {
            await Promise.race([
                itemQueue.add("process-item", {
                    itemId: item._id,
                    url: item.url,
                    userId: req.user.id,
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("Redis queue timeout")), 3000)
                )
            ]);
            return res.status(201).json({ message: "Item saved successfully. Processing in background.", item });
        } catch (queueError) {
            console.error("Queue add error (Redis may be down):", queueError.message);
            return res.status(201).json({ message: "Item saved successfully, but background processing is delayed.", item });
        }
    } catch (error) {
        console.error("Save item error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

// GET /api/items — fetch all items for the logged-in user
export const getItems = async (req, res) => {
    try {
        const items = await Item.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ count: items.length, items });
    } catch (error) {
        console.error("Get items error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

// GET /api/items/resurfaced — fetch items from the last 30/60/90 days (clustered)
export const getResurfacedItems = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

        // 1. Get candidate items from MongoDB (primary source)
        const items = await Item.find({
            userId: req.user.id,
            createdAt: { $gte: cutoff }
        }).sort({ createdAt: -1 }).lean();

        if (items.length === 0) {
            return res.status(200).json({ count: 0, clusters: [] });
        }

        // 2. Build a Qdrant vector map (optional enrichment for k-means)
        const vectorMap = new Map();
        try {
            const allPoints = await getAllUserPoints(req.user.id.toString());
            for (const p of allPoints) {
                if (p.payload?.mongodbId && p.vector?.length > 0) {
                    vectorMap.set(p.payload.mongodbId, p.vector);
                }
            }
        } catch (e) {
            console.error("[Resurface] Qdrant fetch failed, falling back to ungrouped:", e.message);
        }

        // 3. Split: items with vectors (can be k-means clustered) vs without
        const dateStr = (item) => {
            const d = item.createdAt || new Date();
            return d.toISOString ? d.toISOString() : new Date(d).toISOString();
        };

        const mapItem = (item) => ({
            _id: item._id.toString(),
            title: item.title || "Untitled",
            url: item.url,
            tags: item.tags || [],
            description: item.description || "",
            createdAt: dateStr(item),
            image: item.image,
            siteName: item.siteName,
            favicon: item.favicon,
            videoId: item.videoId,
            type: item.type,
        });

        const itemsWithVectors = [];
        const itemsWithout = [];

        for (const item of items) {
            const idStr = item._id.toString();
            const vec = vectorMap.get(idStr);
            if (vec) {
                itemsWithVectors.push({ ...mapItem(item), vector: vec });
            } else {
                itemsWithout.push(mapItem(item));
            }
        }

        // 4. K-means on items that have vectors
        const clusteredEchoes = [];

        if (itemsWithVectors.length > 0) {
            const k = Math.min(6, Math.max(1, Math.ceil(itemsWithVectors.length / 5)));
            const result = kMeansClustering(itemsWithVectors, k);

            result.forEach((cluster, idx) => {
                const tagRanks = {};
                cluster.points.forEach(p => {
                    (p.tags || []).forEach(t => { tagRanks[t] = (tagRanks[t] || 0) + 1; });
                });
                const topTag = Object.keys(tagRanks).sort((a, b) => tagRanks[b] - tagRanks[a])[0];

                clusteredEchoes.push({
                    id: `resurface_cluster_${idx}`,
                    name: topTag || `Memory Group ${idx + 1}`,
                    items: cluster.points.map(({ vector, ...rest }) => rest),
                });
            });
        }

        // 5. Items without vectors go into a plain "Recently Saved" group
        if (itemsWithout.length > 0) {
            clusteredEchoes.push({
                id: "resurface_cluster_unsorted",
                name: "Recently Saved",
                items: itemsWithout,
            });
        }

        return res.status(200).json({
            count: items.length,
            days,
            clusters: clusteredEchoes,
        });
    } catch (error) {
        console.error("Resurface clustering error:", error);
        return res.status(500).json({ message: "Failed to cluster memories." });
    }
};


// POST /api/items/reprocess — re-queue all items that failed to get an embedding
export const reprocessItems = async (req, res) => {
    try {
        const unembedded = await Item.find({
            userId: req.user.id,
            hasEmbedding: { $ne: true },
            status: { $ne: "failed" },
        });

        if (unembedded.length === 0) {
            return res.status(200).json({ message: "All items already have embeddings.", requeued: 0 });
        }

        let requeued = 0;
        for (const item of unembedded) {
            try {
                await itemQueue.add("process-item", {
                    itemId: item._id,
                    url: item.url,
                    userId: req.user.id,
                });
                requeued++;
            } catch (e) {
                console.error(`[Reprocess] Failed to queue ${item._id}: ${e.message}`);
            }
        }

        return res.status(200).json({
            message: `Re-queued ${requeued} items for embedding.`,
            requeued,
            total: unembedded.length,
        });
    } catch (error) {
        console.error("Reprocess error:", error);
        return res.status(500).json({ message: "Server error during reprocess." });
    }
};
