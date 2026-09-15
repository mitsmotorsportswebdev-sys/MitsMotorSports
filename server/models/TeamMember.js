import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        role: { type: String, default: "" },
        department: { type: String, default: "" },
        bio: { type: String, default: "" },
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

teamMemberSchema.index({ isPublished: 1, order: 1 });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;
