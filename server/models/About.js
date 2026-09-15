import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, default: "" },
        image: {
            url: { type: String, default: "" },
            filename: { type: String, default: "" },
            type: { type: String, default: "image/jpeg" },
            size: { type: Number, default: 0 },
        },
        isPublished: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
);

aboutSchema.index({ isPublished: 1 });

const About = mongoose.model("About", aboutSchema);

export default About;
