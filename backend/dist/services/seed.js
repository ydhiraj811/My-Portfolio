import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin.js";
import { Portfolio } from "../models/Portfolio.js";
import { config } from "../config/config.js";
import { defaultContent } from "../utils/defaultContent.js";
export async function seedDatabase() {
    const adminExists = await Admin.exists({ email: config.adminEmail.toLowerCase() });
    if (!adminExists) {
        const passwordHash = await bcrypt.hash(config.adminPassword, 12);
        await Admin.create({ email: config.adminEmail.toLowerCase(), passwordHash });
    }
    const portfolioExists = await Portfolio.exists({});
    if (!portfolioExists) {
        await Portfolio.create(defaultContent);
    }
}
