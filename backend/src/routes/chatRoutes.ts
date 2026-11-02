import { Router } from "express";
import { limitChatRequests, postChatMessage } from "../controllers/chatController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const chatRoutes = Router();

chatRoutes.post("/", limitChatRequests, asyncHandler(postChatMessage));
