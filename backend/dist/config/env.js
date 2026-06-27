import dotenv from "dotenv";
dotenv.config();
export const env = {
    port: Number(process.env.PORT || 5001),
    mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dhiraj_portfolio",
    jwtSecret: process.env.JWT_SECRET || "dev-only-change-this-secret",
    adminEmail: process.env.ADMIN_EMAIL || "admin@dhiraj.dev",
    adminPassword: process.env.ADMIN_PASSWORD || "change-this-password",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    githubUsername: process.env.GITHUB_USERNAME || "ydhiraj811",
    githubToken: process.env.GITHUB_TOKEN || "",
    leetcodeUsername: process.env.LEETCODE_USERNAME || "ydhiraj811",
};
