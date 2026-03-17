import { getAuth } from "@clerk/express";

/**
 * Middleware: require a valid Clerk session.
 * Attaches req.auth = { userId } (clerkId) if authenticated.
 * Returns 401 if not authenticated.
 */
export const requireClerkAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
        return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }
    req.auth = auth;
    next();
};

/**
 * Middleware: protect internal routes called by n8n.
 * Requires header: X-API-Secret matching INTERNAL_API_SECRET env var.
 */
export const requireApiSecret = (req, res, next) => {
    const secret = req.headers["x-api-secret"];
    if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
        return res.status(403).json({ error: "Forbidden. Invalid API secret." });
    }
    next();
};
