import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/connectDb.js";
import {
  clerkMiddleware,
  requireAuth,
  getAuth,
  clerkClient,
} from "@clerk/express";


// if protected routes are needed, use requireAuth() middleware as shown below
// import { requireAuth } from "@clerk/express";

// app.get("/protected", requireAuth(), (req, res) => {
//   res.json({ message: "Protected success" });
// });


dotenv.config();

const PORT = process.env.PORT || 8181;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// routes
app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/protected", (req, res) => {
  res.json({
    message: "Backend working ✅",
  });
});


app.get("/debug", (req, res) => {
  const auth = getAuth(req);

  res.json({
    message: "Clerk check",
    auth,
  });
});


connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });