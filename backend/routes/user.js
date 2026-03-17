import express from "express";
import User from "../models/User.js";
import { requireClerkAuth } from "../middleware/auth.js";
import { encrypt, decrypt } from "../utils/crypto.js";

const router = express.Router();

/**
 * POST /api/user/onboarding
 * Save or update user preferences + integrations after signup.
 * Body: { interests, types, telegramChatId, email, googleAccessToken, googleRefreshToken }
 */
router.post("/onboarding", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const { interests, types, telegramChatId, email, googleAccessToken, googleRefreshToken } =
            req.body;

        const update = {
            clerkId,
            interests: interests || [],
            types: types || [],
            telegramChatId: telegramChatId || null,
            email: email || null,
            onboardingComplete: true,
        };

        // Only update tokens if provided (they may already be set via OAuth callback)
        if (googleAccessToken) update.googleAccessToken = encrypt(googleAccessToken);
        if (googleRefreshToken) update.googleRefreshToken = encrypt(googleRefreshToken);

        const user = await User.findOneAndUpdate({ clerkId }, update, {
            upsert: true,
            new: true,
        });

        res.status(200).json({ success: true, user: sanitizeUser(user) });
    } catch (err) {
        console.error("Onboarding error:", err);
        res.status(500).json({ error: "Failed to save onboarding data." });
    }
});

/**
 * GET /api/user/me
 * Return current logged-in user's profile (safe, no tokens).
 */
router.get("/me", requireClerkAuth, async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ error: "User not found. Complete onboarding." });
        }

        res.json({ user: sanitizeUser(user) });
    } catch (err) {
        console.error("Get user error:", err);
        res.status(500).json({ error: "Failed to fetch user." });
    }
});

/**
 * GET /api/user/all
 * Internal route for n8n — returns all users with decrypted tokens.
 * Protected by X-API-Secret header.
 */
router.get("/all", async (req, res) => {
    const secret = req.headers["x-api-secret"];
    if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
        return res.status(403).json({ error: "Forbidden." });
    }

    try {
        const users = await User.find({ onboardingComplete: true });
        const result = users.map((u) => ({
            clerkId: u.clerkId,
            interests: u.interests,
            types: u.types,
            telegramChatId: u.telegramChatId,
            email: u.email,
            googleAccessToken: decrypt(u.googleAccessToken),
            googleRefreshToken: decrypt(u.googleRefreshToken),
        }));
        res.json({ users: result });
    } catch (err) {
        console.error("Get all users error:", err);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

// Remove token fields from user object before sending to browser
const sanitizeUser = (user) => ({
    clerkId: user.clerkId,
    interests: user.interests,
    types: user.types,
    telegramChatId: user.telegramChatId,
    email: user.email,
    onboardingComplete: user.onboardingComplete,
    googleCalendarConnected: !!user.googleAccessToken,
    createdAt: user.createdAt,
});

export default router;
