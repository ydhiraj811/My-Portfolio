import dotenv from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env"),
];
for (const envPath of envPaths) {
    if (existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false });
    }
}
const configSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5001),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
    ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters"),
    CLIENT_URL: z.string().url().default("http://localhost:5173"),
    GITHUB_USERNAME: z.string().min(1).default("ydhiraj811"),
    GITHUB_TOKEN: z.string().optional().default(""),
    LEETCODE_USERNAME: z.string().min(1).default("ydhiraj811"),
});
const parsed = configSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid backend configuration:");
    console.error(`Checked env files: ${envPaths.join(", ")}`);
    for (const issue of parsed.error.issues) {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
}
export const config = {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    mongoUri: parsed.data.MONGODB_URI,
    jwtSecret: parsed.data.JWT_SECRET,
    adminEmail: parsed.data.ADMIN_EMAIL,
    adminPassword: parsed.data.ADMIN_PASSWORD,
    clientUrl: parsed.data.CLIENT_URL,
    githubUsername: parsed.data.GITHUB_USERNAME,
    githubToken: parsed.data.GITHUB_TOKEN,
    leetcodeUsername: parsed.data.LEETCODE_USERNAME,
};
