import { Router } from "express";
import { getPortfolio, updatePortfolio } from "../controllers/contentController.js";
import { requireAuth } from "../middleware/auth.js";
export const contentRoutes = Router();
contentRoutes.get("/", getPortfolio);
contentRoutes.put("/", requireAuth, updatePortfolio);
