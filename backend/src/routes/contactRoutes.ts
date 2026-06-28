import { Router } from "express";
import { sendContactMessage } from "../controllers/contactController.js";

export const contactRoutes = Router();

contactRoutes.post("/", sendContactMessage);
