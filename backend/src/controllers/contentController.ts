import type { Request, Response } from "express";
import { Portfolio } from "../models/Portfolio.js";
import {
  ContentValidationError,
  contentSlug,
  parseBlog,
  parseBlogs,
  parseProject,
  parseProjects,
  parseProfile,
  sanitizePublicBlog,
  sanitizePublicProfile,
  sanitizePublicProject,
} from "../utils/portfolioContent.js";

const PORTFOLIO_CACHE_TTL_MS = 60_000;
let portfolioCache: { expiresAt: number; data: unknown } | null = null;

async function getPortfolioDocument() {
  const doc = await Portfolio.findOne({});
  if (!doc) {
    throw new Error("Portfolio document not found");
  }
  return doc;
}

export async function getPortfolio(_req: Request, res: Response) {
  if (portfolioCache && portfolioCache.expiresAt > Date.now()) {
    return res.json(portfolioCache.data);
  }

  const doc = await Portfolio.findOne({}).lean();
  const publicData = toPublicPortfolio(doc);
  portfolioCache = { data: publicData, expiresAt: Date.now() + PORTFOLIO_CACHE_TTL_MS };
  return res.json(publicData);
}

export async function getAdminPortfolio(_req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store");
  const doc = await Portfolio.findOne({}).lean();
  return res.json(doc);
}

export async function updatePortfolio(req: Request, res: Response) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ message: "Portfolio content must be an object." });
  }

  const { _id, __v, createdAt, updatedAt, ...payload } = req.body;
  try {
    if (Object.hasOwn(payload, "profile")) payload.profile = parseProfile(payload.profile);
    if (Object.hasOwn(payload, "projects")) payload.projects = parseProjects(payload.projects);
    if (Object.hasOwn(payload, "blogs")) payload.blogs = parseBlogs(payload.blogs);
  } catch (error) {
    return validationError(res, error);
  }

  const current = await Portfolio.findOne({});
  if (!current) {
    const created = await Portfolio.create(payload);
    refreshPortfolioCache(created);
    return res.status(201).json(created);
  }

  current.set(payload);
  await current.save();
  refreshPortfolioCache(current);
  return res.json(current);
}

export async function getProjects(_req: Request, res: Response) {
  const doc = await Portfolio.findOne({}).select("projects").lean();
  return res.json((doc?.projects || []).map(sanitizePublicProject));
}

export async function getProjectBySlug(req: Request, res: Response) {
  const slug = req.params.slug;
  const doc = await Portfolio.findOne({}).select("projects").lean();
  const project = (doc?.projects || []).find((item: any) => contentSlug(item) === slug);
  if (!project) return res.status(404).json({ message: "Project not found" });
  return res.json(sanitizePublicProject(project));
}

export async function replaceProjects(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  let projects;
  try {
    projects = parseProjects(req.body?.projects ?? req.body);
  } catch (error) {
    return validationError(res, error);
  }
  doc.set("projects", projects);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.json(doc);
}

export async function createProject(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  let project;
  try {
    project = parseProject(req.body);
  } catch (error) {
    return validationError(res, error);
  }
  const projects: any[] = doc.get("projects") || [];
  if (projects.some((item: any) => contentSlug(item) === project.slug)) {
    return res.status(409).json({ message: "A project with this URL slug already exists." });
  }
  doc.set("projects", [...projects, project]);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const projects: any[] = doc.get("projects") || [];
  const index = projects.findIndex((item: any) => contentSlug(item) === req.params.slug);
  if (index === -1) return res.status(404).json({ message: "Project not found" });

  const current = projects[index].toObject?.() || projects[index];
  let updated;
  try {
    updated = parseProject({ ...current, ...req.body });
  } catch (error) {
    return validationError(res, error);
  }
  if (projects.some((item: any, itemIndex: number) => itemIndex !== index && contentSlug(item) === updated.slug)) {
    return res.status(409).json({ message: "A project with this URL slug already exists." });
  }
  projects[index] = updated;
  doc.set("projects", projects);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.json(updated);
}

export async function deleteProject(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const projects = doc.get("projects") || [];
  const next = projects.filter((item: any) => contentSlug(item) !== req.params.slug);
  if (next.length === projects.length) return res.status(404).json({ message: "Project not found" });
  doc.set("projects", next);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.status(204).send();
}

export async function getBlogs(_req: Request, res: Response) {
  const doc = await Portfolio.findOne({}).select("blogs").lean();
  return res.json((doc?.blogs || []).filter((blog) => blog.published !== false).map(sanitizePublicBlog));
}

export async function getBlogBySlug(req: Request, res: Response) {
  const slug = req.params.slug;
  const doc = await Portfolio.findOne({}).select("blogs").lean();
  const blog = (doc?.blogs || []).find((item: any) => item.published !== false && contentSlug(item) === slug);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  return res.json(sanitizePublicBlog(blog));
}

export async function replaceBlogs(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  let blogs;
  try {
    blogs = parseBlogs(req.body?.blogs ?? req.body);
  } catch (error) {
    return validationError(res, error);
  }
  doc.set("blogs", blogs);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.json(doc);
}

export async function createBlog(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  let blog;
  try {
    blog = parseBlog(req.body);
  } catch (error) {
    return validationError(res, error);
  }
  const blogs: any[] = doc.get("blogs") || [];
  if (blogs.some((item: any) => contentSlug(item) === blog.slug)) {
    return res.status(409).json({ message: "A blog with this URL slug already exists." });
  }
  doc.set("blogs", [...blogs, blog]);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.status(201).json(blog);
}

export async function updateBlog(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const blogs: any[] = doc.get("blogs") || [];
  const index = blogs.findIndex((item: any) => contentSlug(item) === req.params.slug);
  if (index === -1) return res.status(404).json({ message: "Blog not found" });

  const current = blogs[index].toObject?.() || blogs[index];
  let updated;
  try {
    updated = parseBlog({ ...current, ...req.body }, true);
  } catch (error) {
    return validationError(res, error);
  }
  if (blogs.some((item: any, itemIndex: number) => itemIndex !== index && contentSlug(item) === updated.slug)) {
    return res.status(409).json({ message: "A blog with this URL slug already exists." });
  }
  blogs[index] = updated;
  doc.set("blogs", blogs);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.json(updated);
}

export async function deleteBlog(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const blogs = doc.get("blogs") || [];
  const next = blogs.filter((item: any) => contentSlug(item) !== req.params.slug);
  if (next.length === blogs.length) return res.status(404).json({ message: "Blog not found" });
  doc.set("blogs", next);
  await doc.save();
  refreshPortfolioCache(doc);
  return res.status(204).send();
}

function refreshPortfolioCache(data: unknown) {
  portfolioCache = { data: toPublicPortfolio(data), expiresAt: Date.now() + PORTFOLIO_CACHE_TTL_MS };
}

function toPublicPortfolio(data: any) {
  const portfolio = data?.toObject?.() || data;
  if (!portfolio) return portfolio;
  return {
    ...portfolio,
    profile: portfolio.profile ? sanitizePublicProfile(portfolio.profile) : portfolio.profile,
    projects: (portfolio.projects || []).map(sanitizePublicProject),
    blogs: (portfolio.blogs || []).filter((blog: any) => blog.published !== false).map(sanitizePublicBlog),
  };
}

function validationError(res: Response, error: unknown) {
  if (error instanceof ContentValidationError) {
    return res.status(400).json({ message: error.message });
  }
  throw error;
}
