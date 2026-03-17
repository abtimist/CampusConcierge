import express from "express";
import { google } from "googleapis";
import User from "../models/User.js";
import { encrypt } from "../utils/crypto.js";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

/**
 * GET /api/auth/google
 * Initiate Google OAuth2 flow.
 * Requires ?clerkId=xxx query param (set by frontend before redirecting).
 */
router.get("/google", (req, res) => {
    const { clerkId } = req.query;
    if (!clerkId) return res.status(400).json({ error: "clerkId is required." });

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent", // force refresh token
        scope: SCOPES,
        state: clerkId, // pass clerkId through OAuth state param
    });

    res.redirect(url);
});

/**
 * GET /api/auth/google/callback
 * Google OAuth2 callback. Receives code, exchanges for tokens, stores encrypted.
 */
router.get("/google/callback", async (req, res) => {
    const { code, state: clerkId } = req.query;

    if (!code || !clerkId) {
        return res.status(400).send("Invalid OAuth callback.");
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        const { access_token, refresh_token } = tokens;

        await User.findOneAndUpdate(
            { clerkId },
            {
                googleAccessToken: encrypt(access_token),
                googleRefreshToken: encrypt(refresh_token),
            },
            { upsert: true }
        );

        // Redirect back to frontend onboarding with success flag
        return res.redirect(
            `${process.env.FRONTEND_URL}/onboarding?googleConnected=true`
        );
    } catch (err) {
        console.error("Google OAuth callback error:", err.message);
        return res.redirect(
            `${process.env.FRONTEND_URL}/onboarding?googleConnected=false`
        );
    }
});

export default router;
