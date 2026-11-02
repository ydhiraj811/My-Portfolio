import { Router } from "express";
import { limitContactMessages, sendContactMessage } from "../controllers/contactController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const contactRoutes = Router();

contactRoutes.post("/", limitContactMessages, asyncHandler(sendContactMessage));
