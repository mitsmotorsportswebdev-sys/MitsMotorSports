import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        website: { type: String, default: "" },
        tier: {
            type: String,
            enum: ["gold", "silver", "partner", "featured"],
            default: "partner",
        },
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

sponsorSchema.index({ tier: 1, isPublished: 1, order: 1 });

const Sponsor = mongoose.model("Sponsor", sponsorSchema);

export default Sponsor;
