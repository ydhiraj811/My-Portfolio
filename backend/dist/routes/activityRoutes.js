import { Router } from "express";
import { getActivity } from "../controllers/activityController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
export const activityRoutes = Router();
activityRoutes.get("/", asyncHandler(getActivity));
