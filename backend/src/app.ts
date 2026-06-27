import cors from "cors";
import express from "express";
import { config } from "./config/config.js";
import { activityRoutes } from "./routes/activityRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { contentRoutes } from "./routes/contentRoutes.js";

export const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", contentRoutes);
app.use("/api/activity", activityRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});
