import "dotenv/config";
import cors from "cors";
import express from "express";
import { requireAuth } from "./middleware/auth.js";
import authRouter from "./routes/auth.js";
import tasksRouter from "./routes/tasks.js";
import voiceRouter from "./routes/voice.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Signup/login are public; everything else requires a valid session.
app.use("/api/auth", authRouter);
app.use("/api/tasks", requireAuth, tasksRouter);
app.use("/api/voice", requireAuth, voiceRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`VoiceTask API listening on http://localhost:${PORT}`);
});
