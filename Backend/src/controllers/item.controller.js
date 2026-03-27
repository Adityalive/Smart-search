import { validationResult } from "express-validator";
import Item from "../models/item.model.js";

// POST /api/items — save a new link
export const saveItem = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { url, title } = req.body;

    try {
        const item = await Item.create({ url, title, userId: req.user.id });
        return res.status(201).json({ message: "Item saved.", item });
    } catch (error) {
        console.error("Save item error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

// GET /api/items — fetch all links for the logged-in user
export const getItems = async (req, res) => {
    try {
        const items = await Item.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ count: items.length, items });
    } catch (error) {
        console.error("Get items error:", error);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};
