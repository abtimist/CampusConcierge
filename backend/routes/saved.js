import express from "express";
import SavedOpportunity from "../models/SavedOpportunity.js";
import { requireClerkAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/save
 * Save an opportunity for the logged-in user.
 * Body: { opportunityId }
 */
router.post("/", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const { opportunityId } = req.body;

        if (!opportunityId) {
            return res.status(400).json({ error: "opportunityId is required." });
        }

        const saved = await SavedOpportunity.findOneAndUpdate(
            { userId: clerkId, opportunityId },
            { userId: clerkId, opportunityId },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, saved });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "Already saved." });
        }
        console.error("Save error:", err);
        res.status(500).json({ error: "Failed to save opportunity." });
    }
});

/**
 * DELETE /api/save/:opportunityId
 * Unsave an opportunity.
 */
router.delete("/:opportunityId", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        await SavedOpportunity.findOneAndDelete({
            userId: clerkId,
            opportunityId: req.params.opportunityId,
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to unsave opportunity." });
    }
});

/**
 * GET /api/saved
 * Get all saved opportunities for the logged-in user (populated).
 */
router.get("/", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const saved = await SavedOpportunity.find({ userId: clerkId }).populate(
            "opportunityId"
        );
        const opportunities = saved
            .filter((s) => s.opportunityId) // filter if opportunity was deleted
            .map((s) => s.opportunityId);

        res.json({ opportunities });
    } catch (err) {
        console.error("Get saved error:", err);
        res.status(500).json({ error: "Failed to fetch saved opportunities." });
    }
});

export default router;
