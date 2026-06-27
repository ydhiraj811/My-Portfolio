import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config/config.js";
import { Admin } from "../models/Admin.js";
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export async function login(req, res) {
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
