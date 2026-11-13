import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { standardApiLimiter } from "./middleware/rate-limit.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

// Import Module Routers
import profileRoutes from "./modules/profiles/profile.routes.js";
import farmRoutes from "./modules/farms/farm.routes.js";
import cropRoutes from "./modules/crops/crop.routes.js";
import recommendationRoutes from "./modules/recommendations/recommendation.routes.js";
import advisoryRoutes from "./modules/advisory/advisory.routes.js";
import diseaseRoutes from "./modules/disease/disease.routes.js";
import irrigationNutrientRoutes from "./modules/irrigation-nutrients/irrigation-nutrients.routes.js";
import activityRoutes from "./modules/activities/activity.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS Configuration (Section 18.6)
  const allowedOrigins = [
    env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // Allow in non-production for local network access
          if (env.NODE_ENV !== "production") {
            callback(null, true);
          } else {
            callback(new Error("CORS policy violation"));
          }
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // Body Parsing with security limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Root & Health Check Endpoints
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      service: "agrisage-api",
      version: "1.0.0",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // API v1 Namespace
  const apiV1 = express.Router();

  // Apply Rate Limiter
  apiV1.use(standardApiLimiter);

  apiV1.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      service: "agrisage-api-v1",
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Feature Modules
  apiV1.use(profileRoutes);
  apiV1.use(farmRoutes);
  apiV1.use(cropRoutes);
  apiV1.use(recommendationRoutes);
  apiV1.use(advisoryRoutes);
  apiV1.use(diseaseRoutes);
  apiV1.use(irrigationNutrientRoutes);
  apiV1.use(activityRoutes);
  apiV1.use(dashboardRoutes);

  app.use("/api/v1", apiV1);

  // Catch-all 404 for undefined routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: "ROUTE_NOT_FOUND",
        message: "The requested endpoint does not exist on AgriSage API",
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
