import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().default("http://localhost:5173"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),

  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

  AI_DAILY_LIMIT: z.coerce.number().positive().default(20),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().positive().default(60000),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(8),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
  // In development, provide fallback defaults for local demo if missing
  if (process.env.NODE_ENV !== "production") {
    console.warn("⚠️ Warning: Proceeding with environment defaults for local setup.");
  } else {
    throw new Error("Missing or invalid environment variables");
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: (process.env.NODE_ENV as "development" | "test" | "production") || "development",
      PORT: Number(process.env.PORT) || 5000,
      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
      SUPABASE_URL: process.env.SUPABASE_URL || "http://localhost:54321",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "local-anon-key-placeholder",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "local-service-role-key-placeholder",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "demo-key",
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      AI_DAILY_LIMIT: Number(process.env.AI_DAILY_LIMIT) || 20,
      AI_REQUEST_TIMEOUT_MS: Number(process.env.AI_REQUEST_TIMEOUT_MS) || 60000,
      MAX_UPLOAD_SIZE_MB: Number(process.env.MAX_UPLOAD_SIZE_MB) || 8,
      RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
      RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
    };
