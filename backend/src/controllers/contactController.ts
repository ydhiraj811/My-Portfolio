import type { Request, Response } from "express";
import { z } from "zod";
import { sendContactMail } from "../services/mailService.js";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  email: z.string().trim().email("Valid email is required").max(120),
  subject: z.string().trim().min(3, "Subject is required").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
  website: z.string().optional().default(""),
});

export async function sendContactMessage(req: Request, res: Response) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid contact form data" });
  }

  if (parsed.data.website) {
    return res.json({ ok: true });
  }

  try {
    await sendContactMail(parsed.data);
    return res.json({ ok: true, message: "Message sent successfully" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send message";
    const status = message === "Mail service is not configured" ? 503 : 500;
    return res.status(status).json({ message });
  }
}
