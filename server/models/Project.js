import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        category: { type: String, default: "general" },
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

projectSchema.index({ slug: 1 }, { unique: true });
projectSchema.index({ isPublished: 1, order: 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
