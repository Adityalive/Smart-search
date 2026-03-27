import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: [true, "URL is required"],
            trim: true,
        },
        title: {
            type: String,
            trim: true,
            default: "",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
