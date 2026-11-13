import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

if (!env.GEMINI_API_KEY) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined. AI endpoints will require a valid key at runtime.");
}

export const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY || "dummy_key",
});

export const GEMINI_MODEL = env.GEMINI_MODEL || "gemini-2.5-flash";
