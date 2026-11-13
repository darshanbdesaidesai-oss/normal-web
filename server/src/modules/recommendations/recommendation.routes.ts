import { Router } from "express";
import {
  generateCropRecommendations,
  listCropRecommendations,
  getCropRecommendation,
  deleteCropRecommendation,
} from "./recommendation.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { aiGenerationLimiter } from "../../middleware/rate-limit.middleware.js";
import { cropRecommendationRequestSchema } from "../../schemas/index.js";

const router = Router();

router.post(
  "/ai/crop-recommendations",
  requireAuth,
  aiGenerationLimiter,
  validateBody(cropRecommendationRequestSchema),
  generateCropRecommendations
);

router.get("/crop-recommendations", requireAuth, listCropRecommendations);
router.get("/crop-recommendations/:id", requireAuth, getCropRecommendation);
router.delete("/crop-recommendations/:id", requireAuth, deleteCropRecommendation);

export default router;
