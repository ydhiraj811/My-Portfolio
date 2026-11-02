import type { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  message: string;
};

type WindowEntry = { count: number; expiresAt: number };
const MAX_CLIENTS = 5000;

export function createRateLimiter({ limit, windowMs, message }: RateLimitOptions) {
  const windows = new Map<string, WindowEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    let entry = windows.get(key);

    if (!entry || entry.expiresAt <= now) {
      if (!entry && windows.size >= MAX_CLIENTS) {
        for (const [client, window] of windows) {
          if (window.expiresAt <= now) windows.delete(client);
        }
        if (windows.size >= MAX_CLIENTS) {
          return res.status(429).json({ message: "The service is busy. Please try again shortly." });
        }
      }
      entry = { count: 0, expiresAt: now + windowMs };
      windows.set(key, entry);
    }

    if (entry.count >= limit) {
      res.setHeader("Retry-After", Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)));
      return res.status(429).json({ message });
    }

    entry.count += 1;
    return next();
  };
}
