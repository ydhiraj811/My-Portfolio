import type { Request, Response } from "express";
import { z } from "zod";
import { ContactMessage } from "../models/ContactMessage.js";
import { isMailConfigured, sendContactMail } from "../services/mailService.js";
import { createRateLimiter } from "../middleware/rateLimit.js";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80).refine((value) => !/[\r\n\0]/.test(value), "Name contains invalid characters"),
  email: z.string().trim().email("Valid email is required").max(120),
  subject: z.string().trim().min(3, "Subject is required").max(120).refine((value) => !/[\r\n\0]/.test(value), "Subject contains invalid characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
  website: z.string().optional().default(""),
});

export const limitContactMessages = createRateLimiter({
  limit: 20,
  windowMs: 10 * 60_000,
  message: "Too many messages were sent from this connection. Please try again later.",
});

export async function getContactMessages(_req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store");
  const records = await ContactMessage.find()
    .select("name email subject message emailSent mailError createdAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.json({
    messages: records.map((record) => ({
      id: record._id.toString(),
      name: record.name,
      email: record.email,
      subject: record.subject,
      message: record.message,
      emailSent: Boolean(record.emailSent),
      mailError: record.mailError || "",
      createdAt: record.createdAt.toISOString(),
    })),
  });
}

export async function sendContactMessage(req: Request, res: Response) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid contact form data" });
  }

  if (parsed.data.website) {
    return res.json({ ok: true });
  }

  let savedMessage;
  try {
    savedMessage = await ContactMessage.create({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
  } catch (error) {
    console.error("Unable to store contact message", error);
    return res.status(503).json({ message: "Messages are temporarily unavailable. Please email me directly." });
  }

  const mailConfigured = isMailConfigured();
  let emailSent = false;
  let mailError = "";

  if (mailConfigured) {
    try {
      await sendContactMail(parsed.data);
      emailSent = true;
    } catch (error: unknown) {
      mailError = error instanceof Error ? error.message : "Unable to send email notification";
      console.error("Unable to send contact email", mailError);
    }
  }

  try {
    await savedMessage.updateOne({ emailSent, mailError });
  } catch (error) {
    console.error("Unable to record contact email status", error);
  }

  const message = emailSent
    ? "Message received. The email provider accepted the notification."
    : mailConfigured
      ? "Message saved to the admin inbox, but the email notification failed. Please email me directly."
      : "Message saved to the admin inbox. Email notifications are not configured yet.";

  return res.json({ ok: true, message, emailSent });
}
