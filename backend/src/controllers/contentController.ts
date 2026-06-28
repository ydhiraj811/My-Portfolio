import type { Request, Response } from "express";
import { Portfolio } from "../models/Portfolio.js";

function slugify(value = "") {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function getPortfolioDocument() {
  const doc = await Portfolio.findOne({});
  if (!doc) {
    throw new Error("Portfolio document not found");
  }
  return doc;
}

export async function getPortfolio(_req: Request, res: Response) {
  const doc = await Portfolio.findOne({}).lean();
  return res.json(doc);
}

export async function updatePortfolio(req: Request, res: Response) {
  const { _id, __v, createdAt, updatedAt, ...payload } = req.body;
  const current = await Portfolio.findOne({});
  if (!current) {
    const created = await Portfolio.create(payload);
    return res.status(201).json(created);
  }

  current.set(payload);
  await current.save();
  return res.json(current);
}

export async function getProjects(_req: Request, res: Response) {
  const doc = await Portfolio.findOne({}).select("projects").lean();
  return res.json(doc?.projects || []);
}

export async function getProjectBySlug(req: Request, res: Response) {
  const slug = req.params.slug;
  const doc = await Portfolio.findOne({}).select("projects").lean();
  const project = (doc?.projects || []).find((item: any) => (item.slug || slugify(item.title)) === slug);
  if (!project) return res.status(404).json({ message: "Project not found" });
  return res.json(project);
}

export async function replaceProjects(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  doc.set("projects", req.body.projects || req.body);
  await doc.save();
  return res.json(doc);
}

export async function createProject(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const project = { ...req.body, slug: req.body.slug || slugify(req.body.title) };
  doc.set("projects", [...(doc.get("projects") || []), project]);
  await doc.save();
  return res.status(201).json(project);
}

export async function updateProject(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const projects = doc.get("projects") || [];
  const index = projects.findIndex((item: any) => (item.slug || slugify(item.title)) === req.params.slug);
  if (index === -1) return res.status(404).json({ message: "Project not found" });

  const current = projects[index].toObject?.() || projects[index];
  const updated = { ...current, ...req.body, slug: req.body.slug || req.params.slug };
  projects[index] = updated;
  doc.set("projects", projects);
  await doc.save();
  return res.json(updated);
}

export async function deleteProject(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const projects = doc.get("projects") || [];
  const next = projects.filter((item: any) => (item.slug || slugify(item.title)) !== req.params.slug);
  if (next.length === projects.length) return res.status(404).json({ message: "Project not found" });
  doc.set("projects", next);
  await doc.save();
  return res.status(204).send();
}

export async function getBlogs(_req: Request, res: Response) {
  const doc = await Portfolio.findOne({}).select("blogs").lean();
  return res.json(doc?.blogs || []);
}

export async function getBlogBySlug(req: Request, res: Response) {
  const slug = req.params.slug;
  const doc = await Portfolio.findOne({}).select("blogs").lean();
  const blog = (doc?.blogs || []).find((item: any) => (item.slug || slugify(item.title)) === slug);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  return res.json(blog);
}

export async function replaceBlogs(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  doc.set("blogs", req.body.blogs || req.body);
  await doc.save();
  return res.json(doc);
}

export async function createBlog(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const blog = { ...req.body, slug: req.body.slug || slugify(req.body.title) };
  doc.set("blogs", [...(doc.get("blogs") || []), blog]);
  await doc.save();
  return res.status(201).json(blog);
}

export async function updateBlog(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const blogs = doc.get("blogs") || [];
  const index = blogs.findIndex((item: any) => (item.slug || slugify(item.title)) === req.params.slug);
  if (index === -1) return res.status(404).json({ message: "Blog not found" });

  const current = blogs[index].toObject?.() || blogs[index];
  const updated = { ...current, ...req.body, slug: req.body.slug || req.params.slug };
  blogs[index] = updated;
  doc.set("blogs", blogs);
  await doc.save();
  return res.json(updated);
}

export async function deleteBlog(req: Request, res: Response) {
  const doc = await getPortfolioDocument();
  const blogs = doc.get("blogs") || [];
  const next = blogs.filter((item: any) => (item.slug || slugify(item.title)) !== req.params.slug);
  if (next.length === blogs.length) return res.status(404).json({ message: "Blog not found" });
  doc.set("blogs", next);
  await doc.save();
  return res.status(204).send();
}
