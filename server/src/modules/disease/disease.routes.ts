import { Router } from "express";
import {
  analyzeCropDisease,
  uploadCropImage,
  listDiseaseReports,
  getDiseaseReport,
  deleteDiseaseReport,
} from "./disease.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { aiGenerationLimiter } from "../../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/ai/disease-analysis",
  requireAuth,
  aiGenerationLimiter,
  uploadCropImage.single("image"),
  analyzeCropDisease
);

router.get("/disease-reports", requireAuth, listDiseaseReports);
router.get("/disease-reports/:id", requireAuth, getDiseaseReport);
router.delete("/disease-reports/:id", requireAuth, deleteDiseaseReport);

export default router;
