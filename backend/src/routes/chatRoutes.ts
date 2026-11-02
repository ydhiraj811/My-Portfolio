import { Router } from "express";
import { limitChatRequests, postChatMessage } from "../controllers/chatController.js";

export const chatRoutes = Router();

chatRoutes.post("/", limitChatRequests, postChatMessage);
