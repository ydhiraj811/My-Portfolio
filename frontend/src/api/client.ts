import type { ActivityResponse, Portfolio } from "../types/portfolio";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5001/api" : "/api");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 15_000) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: requestHeaders(options),
      signal: options.signal || AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new ApiError("The request timed out. Please try again.", 0);
    }
    throw new ApiError("Unable to connect to the server. Please try again or email me directly.", 0);
  }

  if (response.status === 204 || response.status === 205) return undefined as T;

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(result?.message || "Request failed", response.status);
  }

  if (result === null) {
    throw new ApiError("The server returned an invalid response", response.status);
  }

  return result as T;
}

function requestHeaders(options: RequestInit) {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

export const api = {
  getPortfolio: () => request<Portfolio>("/portfolio"),
  getAdminPortfolio: (token: string) => request<Portfolio>("/portfolio/admin", {
    headers: { Authorization: `Bearer ${token}` },
  }),
  getActivity: () => request<ActivityResponse>("/activity", {}, 20_000),
  sendContact: (payload: { name: string; email: string; subject: string; message: string; website?: string }) =>
    request<{ ok: boolean; message?: string; emailSent?: boolean }>("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  askAssistant: (messages: Array<{ role: "user" | "assistant"; content: string }>) =>
    request<{ reply: string }>("/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }, 30_000),
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
