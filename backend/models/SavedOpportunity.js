import mongoose from "mongoose";

const savedOpportunitySchema = new mongoose.Schema(
    {
        userId: {
            type: String, // clerkId
            required: true,
        },
        opportunityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent a user from saving the same opportunity twice
savedOpportunitySchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

const SavedOpportunity = mongoose.model("SavedOpportunity", savedOpportunitySchema);
export default SavedOpportunity;
