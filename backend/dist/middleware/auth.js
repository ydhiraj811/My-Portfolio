import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
export function requireAuth(req, res, next) {
    res.setHeader("Cache-Control", "no-store");
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) {
        return res.status(401).json({ message: "Missing auth token" });
    }
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        req.adminId = payload.sub;
        return next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
