import { Router } from "express";
import { getActivity } from "../controllers/activityController.js";

export const activityRoutes = Router();

activityRoutes.get("/", getActivity);
