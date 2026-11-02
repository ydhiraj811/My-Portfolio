import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) return _next(error);

  console.error("Unhandled API request error", error instanceof Error ? error.message : error);
  const candidateStatus = typeof error === "object" && error !== null && "status" in error
    ? Number(error.status)
    : 500;
  const status = Number.isInteger(candidateStatus) && candidateStatus >= 400 && candidateStatus < 500
    ? candidateStatus
    : 500;
  const message = status === 413
    ? "The request body is too large."
    : status === 400
      ? "The request body is invalid."
      : "The server could not complete the request.";
  res.status(status).json({ message });
};
