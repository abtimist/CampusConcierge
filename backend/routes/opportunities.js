import express from "express";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";
import { requireClerkAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/opportunities
 * Return opportunities filtered by the logged-in user's interests + types.
 * Optionally: ?type=hackathon&page=1&limit=20
 */
router.get("/", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        const { type, page = 1, limit = 20 } = req.query;

        const filter = {};

        // Filter by user's preferred types (unless overridden by query)
        if (type) {
            filter.type = type;
        } else if (user?.types?.length > 0) {
            filter.type = { $in: user.types };
        }

        // Filter by user's interests via tags
        if (user?.interests?.length > 0) {
            filter.tags = { $in: user.interests };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [opportunities, total] = await Promise.all([
            Opportunity.find(filter)
                .sort({ deadline: 1 })
                .skip(skip)
                .limit(Number(limit)),
            Opportunity.countDocuments(filter),
        ]);

        res.json({
            opportunities,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (err) {
        console.error("Get opportunities error:", err);
        res.status(500).json({ error: "Failed to fetch opportunities." });
    }
});

/**
 * POST /api/opportunity
 * Insert a new opportunity — called by n8n scraper workflow.
 * Protected by X-API-Secret header.
 */
router.post("/", async (req, res) => {
    const secret = req.headers["x-api-secret"];
    if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
        return res.status(403).json({ error: "Forbidden." });
    }

    try {
        const { title, description, link, deadline, type, tags, source } = req.body;

        if (!title || !link || !deadline || !type) {
            return res.status(400).json({ error: "title, link, deadline, and type are required." });
        }

        // upsert by link to avoid duplicates
        const opp = await Opportunity.findOneAndUpdate(
            { link },
            { title, description, link, deadline: new Date(deadline), type, tags: tags || [], source: source || "manual" },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, opportunity: opp });
    } catch (err) {
        console.error("Insert opportunity error:", err);
        res.status(500).json({ error: "Failed to insert opportunity." });
    }
});

/**
 * GET /api/opportunity/:id
 * Fetch a single opportunity by ID — used by n8n calendar workflow.
 */
router.get("/:id", async (req, res) => {
    try {
        const opp = await Opportunity.findById(req.params.id);
        if (!opp) return res.status(404).json({ error: "Opportunity not found." });
        res.json({ opportunity: opp });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch opportunity." });
    }
});

export default router;
