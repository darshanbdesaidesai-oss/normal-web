import { Router } from "express";
import {
  generateAdvisory,
  listAdvisories,
  getAdvisory,
  deleteAdvisory,
} from "./advisory.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { aiGenerationLimiter } from "../../middleware/rate-limit.middleware.js";
import { advisoryRequestSchema } from "../../schemas/index.js";

const router = Router();

router.post(
  "/ai/advisory",
  requireAuth,
  aiGenerationLimiter,
  validateBody(advisoryRequestSchema),
  generateAdvisory
);

router.get("/advisories", requireAuth, listAdvisories);
router.get("/advisories/:id", requireAuth, getAdvisory);
router.delete("/advisories/:id", requireAuth, deleteAdvisory);

export default router;
