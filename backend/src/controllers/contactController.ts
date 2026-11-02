import type { Request, Response } from "express";
import { z } from "zod";
import { ContactMessage } from "../models/ContactMessage.js";
import { isMailConfigured, sendContactMail } from "../services/mailService.js";

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

  if (!isMailConfigured()) {
    return res.json({
      ok: true,
      message: "Message received successfully",
      emailSent: false,
    });
  }

  void sendContactMail(parsed.data)
    .then(() => savedMessage.updateOne({ emailSent: true, mailError: "" }))
    .catch(async (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to send message";
      try {
        await savedMessage.updateOne({ mailError: message });
      } catch (saveError) {
        console.error("Unable to record contact email status", saveError);
      }
    });

  return res.json({ ok: true, message: "Message received successfully", emailSent: false });
}
