import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { config } from "../config/config.js";
import { Portfolio } from "../models/Portfolio.js";
import { ChatServiceError, generatePortfolioReply } from "../services/chatService.js";

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(1000),
  })).min(1).max(10),
});

const requestWindows = new Map<string, { count: number; expiresAt: number }>();
const rateLimit = 30;
const rateWindowMs = 60_000;

export function limitChatRequests(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || "unknown";
  const window = requestWindows.get(key);

  if (!window || window.expiresAt <= now) {
    requestWindows.set(key, { count: 1, expiresAt: now + rateWindowMs });
  } else if (window.count >= rateLimit) {
    return res.status(429).json({ message: "Please wait a moment before sending another message." });
  } else {
    window.count += 1;
  }

  if (requestWindows.size > 1000) {
    for (const [client, entry] of requestWindows) {
      if (entry.expiresAt <= now) requestWindows.delete(client);
    }
  }

  return next();
}

export async function postChatMessage(req: Request, res: Response) {
  if (!config.gemini.apiKey) {
    return res.status(503).json({ message: "The AI assistant is not configured yet. Please use the contact section instead." });
  }

  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Send a message of up to 1,000 characters." });
  }

  if (parsed.data.messages.at(-1)?.role !== "user") {
    return res.status(400).json({ message: "The latest chat message must be from you." });
  }

  try {
    const portfolio = await Portfolio.findOne({})
      .select("profile.name profile.role profile.location profile.email profile.headline profile.summary profile.about profile.github profile.linkedin profile.leetcode stats stack skills experience projects.title projects.year projects.summary projects.stack projects.highlights projects.links education blogs.title blogs.date blogs.excerpt blogs.published")
      .lean();

    if (!portfolio) {
      return res.status(503).json({ message: "Portfolio details are temporarily unavailable." });
    }

    const context = {
      profile: portfolio.profile,
      stats: portfolio.stats,
      stack: portfolio.stack,
      skills: portfolio.skills,
      experience: portfolio.experience,
      projects: portfolio.projects,
      education: portfolio.education,
      blogs: portfolio.blogs.filter((blog) => blog.published !== false),
    };
    const reply = await generatePortfolioReply(parsed.data.messages.slice(-10), context);
    return res.json({ reply });
  } catch (error) {
    if (error instanceof ChatServiceError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error("Portfolio chat failed", error);
    return res.status(503).json({ message: "Portfolio chat is temporarily unavailable. Please try again." });
  }
}
