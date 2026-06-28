import nodemailer from "nodemailer";
import { config } from "../config/config.js";

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function isMailConfigured() {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass && config.smtp.toEmail && config.smtp.fromEmail);
}

export async function sendContactMail(message: ContactMessage) {
  if (!isMailConfigured()) {
    throw new Error("Mail service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact" <${config.smtp.fromEmail}>`,
    to: config.smtp.toEmail,
    replyTo: `${message.name} <${message.email}>`,
    subject: `Portfolio contact: ${message.subject}`,
    text: [
      `Name: ${message.name}`,
      `Email: ${message.email}`,
      `Subject: ${message.subject}`,
      "",
      message.message,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New portfolio message</h2>
        <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(message.subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message.message).replace(/\n/g, "<br />")}</p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
