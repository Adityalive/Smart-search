import { validationResult } from "express-validator";
import Item from "../models/item.model.js";
import { extractPdfContent } from "../services/pdf.js";
import itemQueue from "../queues/itemQueues.js";

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
            } else if (req.file.mimetype.startsWith("image/")) {
                type = "image";
                title = title || req.file.originalname;
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
        };
        
        if (url) itemData.url = url;
        if (collectionId) itemData.collectionId = collectionId;

        const item = await Item.create(itemData);

        // Add to background processing queue (for scraping URLs, or doing AI Tagging/Embedding for both)
        await itemQueue.add("process-item", {
            itemId: item._id,
            url: item.url,
            userId: req.user.id,
        });

        return res.status(201).json({ message: "Item saved successfully. Processing in background.", item });
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

