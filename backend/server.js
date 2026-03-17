import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDb from "./config/connectDb.js";

// Routes
import userRoutes from "./routes/user.js";
import opportunityRoutes from "./routes/opportunities.js";
import savedRoutes from "./routes/saved.js";
import calendarRoutes from "./routes/calendar.js";
import syncRoutes from "./routes/sync.js";
import googleAuthRoutes from "./routes/googleAuth.js";

dotenv.config();

const PORT = process.env.PORT || 8181;
const app = express();

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware()); // Attaches auth info to req; use requireClerkAuth in routes

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Missed Opportunity Detector API" });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/user", userRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/opportunity", opportunityRoutes); // alias for n8n POST
app.use("/api/save", savedRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/sync-trigger", syncRoutes);
app.use("/api/auth", googleAuthRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

// ── Start ─────────────────────────────────────────────────────────────────────
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server started on port ${PORT}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });