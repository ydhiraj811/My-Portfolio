import mongoose, { Schema } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    emailSent: { type: Boolean, default: false },
    mailError: { type: String, default: "" },
  },
  { timestamps: true },
);

export const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
