import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
        },
        interests: {
            type: [String],
            default: [],
            // e.g. ["AI", "Web Dev", "Blockchain", "Mobile", "Cloud", "Data Science"]
        },
        types: {
            type: [String],
            default: [],
            // e.g. ["internship", "hackathon", "job"]
        },
        telegramChatId: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        // Encrypted with AES before storing
        googleAccessToken: {
            type: String,
            default: null,
        },
        googleRefreshToken: {
            type: String,
            default: null,
        },
        onboardingComplete: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
