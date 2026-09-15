import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: "" },
        heroImage: {
            url: { type: String, required: true },
            filename: { type: String, required: true },
            type: { type: String, default: "image/jpeg" },
            size: { type: Number, default: 0 },
        },
        sections: [{ type: mongoose.Schema.Types.Mixed }],
        isPublished: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    },
);

homeSchema.index({ isPublished: 1 });

const Home = mongoose.model("Home", homeSchema);

export default Home;
