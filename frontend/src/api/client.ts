import type { ActivityResponse, Portfolio } from "../types/portfolio";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(error.message || "Request failed", response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getPortfolio: () => request<Portfolio>("/portfolio"),
  getActivity: () => request<ActivityResponse>("/activity"),
  login: (email: string, password: string) =>
    request<{ token: string; admin: { email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  updatePortfolio: (portfolio: Portfolio, token: string) =>
    request<Portfolio>("/portfolio", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(portfolio),
    }),
  updateProjects: (projects: Portfolio["projects"], token: string) =>
    request<Portfolio>("/portfolio/projects", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ projects }),
    }),
  updateBlogs: (blogs: Portfolio["blogs"], token: string) =>
    request<Portfolio>("/portfolio/blogs", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ blogs }),
    }),
};
