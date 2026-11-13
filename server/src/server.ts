import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🌾 AgriSage AI Server running on http://localhost:${env.PORT}`);
  console.log(`📡 Health Check: http://localhost:${env.PORT}/health`);
  console.log(`🤖 Gemini Model: ${env.GEMINI_MODEL}`);
  console.log(`🔒 Mode: ${env.NODE_ENV}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing HTTP server gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});
