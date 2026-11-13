import { Request, Response, NextFunction } from "express";

export interface AppCustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppCustomError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "APP_ERROR");
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "An unexpected internal server error occurred"
      : err.message || "An unexpected error occurred";

  console.error(`[Error Handler] ${code} (${statusCode}):`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
