import express from "express";
import axios from "axios";
import { requireClerkAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/sync-trigger
 * Manually trigger the n8n scraper workflow.
 * Requires authenticated user (any logged-in user can trigger a sync).
 */
router.post("/", requireClerkAuth, async (req, res) => {
    try {
        const webhookUrl = process.env.N8N_SYNC_WEBHOOK_URL;
        if (!webhookUrl) {
            return res.status(500).json({ error: "Sync webhook not configured." });
        }

        await axios.post(webhookUrl, { triggeredBy: req.auth.userId });
        res.json({ success: true, message: "Sync triggered successfully." });
    } catch (err) {
        console.error("Sync trigger error:", err.message);
        res.status(500).json({ error: "Failed to trigger sync." });
    }
});

export default router;
