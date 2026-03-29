import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        query: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["search", "navigation"],
            default: "search",
        },
    },
    { timestamps: true }
);

// Index for faster retrieval of user history in chronological order
historySchema.index({ user: 1, createdAt: -1 });

const History = mongoose.model("History", historySchema);
export default History;
