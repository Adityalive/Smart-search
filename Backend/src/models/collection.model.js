import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Collection name is required"],
            trim: true,
        },
        description: {
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

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
