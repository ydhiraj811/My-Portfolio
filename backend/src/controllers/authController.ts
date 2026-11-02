import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config/config.js";
import { Admin } from "../models/Admin.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});

export const limitLoginAttempts = createRateLimiter({
  limit: 10,
  windowMs: 15 * 60_000,
  message: "Too many sign-in attempts. Please wait before trying again.",
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const admin = await Admin.findOne({ email: parsed.data.email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ sub: admin.id, email: admin.email }, config.jwtSecret, { expiresIn: "8h" });
  return res.json({ token, admin: { email: admin.email } });
}
