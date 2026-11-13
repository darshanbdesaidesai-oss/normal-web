import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

// Standard API rate limiter
export const standardApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please wait a moment before trying again.",
    },
  },
});

// Stricter rate limiter for AI generation endpoints to prevent quota exhaustion
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // Max 10 AI operations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "AI_RATE_LIMIT_EXCEEDED",
      message: "AI request quota reached for this minute. Please wait 60 seconds before generating more advisories.",
    },
  },
});
