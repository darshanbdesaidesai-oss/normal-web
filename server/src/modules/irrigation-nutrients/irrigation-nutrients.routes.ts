import { Router } from "express";
import {
  generateIrrigationAdvisory,
  generateNutrientAdvisory,
} from "./irrigation-nutrients.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { aiGenerationLimiter } from "../../middleware/rate-limit.middleware.js";
import { irrigationRequestSchema, nutrientRequestSchema } from "../../schemas/index.js";

const router = Router();

router.post(
  "/ai/irrigation-advisory",
  requireAuth,
  aiGenerationLimiter,
  validateBody(irrigationRequestSchema),
  generateIrrigationAdvisory
);

router.post(
  "/ai/nutrient-advisory",
  requireAuth,
  aiGenerationLimiter,
  validateBody(nutrientRequestSchema),
  generateNutrientAdvisory
);

export default router;
