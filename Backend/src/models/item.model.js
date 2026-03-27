import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["url", "pdf", "image", "video", "post", "other"],
            default: "url",
        },
        url: {
            type: String,
            trim: true,
            // Not required globally anymore because a PDF upload might not have a URL
        },
        title: {
            type: String,
            trim: true,
            default: "", // We will populate this from scraping if empty
        },
        description: {
            type: String,
            trim: true,
            default: "", // Populated from meta description
        },
        content: {
            type: String,
            default: "", // Populated with main article text or extracted PDF text
        },
        filePath: {
            type: String, // Path or object URL to the stored file (e.g. for PDFs/images)
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        collectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Collection",
        },
    },
    { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
