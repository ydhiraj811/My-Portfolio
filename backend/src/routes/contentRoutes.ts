import { Router } from "express";
import {
  createBlog,
  createProject,
  deleteBlog,
  deleteProject,
  getBlogBySlug,
  getBlogs,
  getPortfolio,
  getProjectBySlug,
  getProjects,
  replaceBlogs,
  replaceProjects,
  updateBlog,
  updatePortfolio,
  updateProject,
} from "../controllers/contentController.js";
import { requireAuth } from "../middleware/auth.js";

export const contentRoutes = Router();

contentRoutes.get("/", getPortfolio);
contentRoutes.put("/", requireAuth, updatePortfolio);

contentRoutes.get("/projects", getProjects);
contentRoutes.get("/projects/:slug", getProjectBySlug);
contentRoutes.put("/projects", requireAuth, replaceProjects);
contentRoutes.post("/projects", requireAuth, createProject);
contentRoutes.put("/projects/:slug", requireAuth, updateProject);
contentRoutes.delete("/projects/:slug", requireAuth, deleteProject);

contentRoutes.get("/blogs", getBlogs);
contentRoutes.get("/blogs/:slug", getBlogBySlug);
contentRoutes.put("/blogs", requireAuth, replaceBlogs);
contentRoutes.post("/blogs", requireAuth, createBlog);
contentRoutes.put("/blogs/:slug", requireAuth, updateBlog);
contentRoutes.delete("/blogs/:slug", requireAuth, deleteBlog);
