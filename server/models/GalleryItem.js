import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
    {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        image: {
            url: { type: String, required: true },
            filename: { type: String, required: true },
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

galleryItemSchema.index({ isPublished: 1, order: 1 });

const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);

export default GalleryItem;
