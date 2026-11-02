import { Router } from "express";
import { getContactMessages, limitContactMessages, sendContactMessage } from "../controllers/contactController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

export const contactRoutes = Router();

contactRoutes.get("/messages", requireAuth, asyncHandler(getContactMessages));
contactRoutes.post("/", limitContactMessages, asyncHandler(sendContactMessage));
