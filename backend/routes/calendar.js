import express from "express";
import axios from "axios";
import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import { requireClerkAuth } from "../middleware/auth.js";
import { decrypt } from "../utils/crypto.js";

const router = express.Router();

/**
 * POST /api/calendar/add
 * Trigger n8n Calendar workflow to create a Google Calendar event.
 * Body: { opportunityId }
 */
router.post("/add", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const { opportunityId } = req.body;

        if (!opportunityId) {
            return res.status(400).json({ error: "opportunityId is required." });
        }

        const [user, opportunity] = await Promise.all([
            User.findOne({ clerkId }),
            Opportunity.findById(opportunityId),
        ]);

        if (!user) return res.status(404).json({ error: "User not found." });
        if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });

        if (!user.googleAccessToken) {
            return res.status(400).json({ error: "Google Calendar not connected. Please complete onboarding." });
        }

        // Forward to n8n webhook with decrypted tokens (back-end to back-end only)
        const webhookUrl = process.env.N8N_CALENDAR_WEBHOOK_URL;
        if (!webhookUrl) {
            return res.status(500).json({ error: "Calendar webhook not configured." });
        }

        await axios.post(webhookUrl, {
            userId: clerkId,
            opportunityId: opportunity._id,
            opportunityTitle: opportunity.title,
            opportunityDeadline: opportunity.deadline,
            opportunityLink: opportunity.link,
            opportunityDescription: opportunity.description,
            googleAccessToken: decrypt(user.googleAccessToken),
            googleRefreshToken: decrypt(user.googleRefreshToken),
        });

        res.json({ success: true, message: "Calendar event creation triggered." });
    } catch (err) {
        console.error("Calendar add error:", err.message);
        res.status(500).json({ error: "Failed to trigger calendar event." });
    }
});

export default router;
