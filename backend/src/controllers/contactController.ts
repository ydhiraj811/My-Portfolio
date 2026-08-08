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

  const savedMessage = await ContactMessage.create({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (!isMailConfigured()) {
    return res.json({
      ok: true,
      message: "Message received successfully",
      emailSent: false,
    });
  }

  try {
    await sendContactMail(parsed.data);
    savedMessage.emailSent = true;
    savedMessage.mailError = "";
    await savedMessage.save();
    return res.json({ ok: true, message: "Message sent successfully", emailSent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send message";
    savedMessage.mailError = message;
    await savedMessage.save();
    return res.json({
      ok: true,
      message: "Message received successfully",
      emailSent: false,
    });
  }
}
