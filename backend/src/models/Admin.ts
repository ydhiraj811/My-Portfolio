import mongoose, { Schema } from "mongoose";

export interface AdminDocument extends mongoose.Document {
  email: string;
  passwordHash: string;
}

const adminSchema = new Schema<AdminDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
