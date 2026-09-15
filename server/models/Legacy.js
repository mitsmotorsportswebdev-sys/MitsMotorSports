import mongoose from "mongoose";

const legacySchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        image: {
            url: { type: String, default: "" },
            filename: { type: String, default: "" },
            type: { type: String, default: "image/jpeg" },
            size: { type: Number, default: 0 },
        },
        isPublished: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    },
);

legacySchema.index({ isPublished: 1, order: 1 });

const Legacy = mongoose.model("Legacy", legacySchema);

export default Legacy;
