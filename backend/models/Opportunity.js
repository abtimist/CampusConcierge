import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        link: {
            type: String,
            required: true,
        },
        deadline: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            enum: ["internship", "hackathon", "job"],
            required: true,
        },
        tags: {
            type: [String],
            default: [],
            // e.g. ["AI", "Web Dev", "Remote"]
        },
        source: {
            type: String,
            default: "manual",
            // e.g. "devpost", "linkedin", "unstop", "manual"
        },
    },
    { timestamps: true }
);

// Prevent duplicate opportunities by link
opportunitySchema.index({ link: 1 }, { unique: true });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;
