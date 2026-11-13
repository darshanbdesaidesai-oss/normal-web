import { Router } from "express";
import {
  listFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
} from "./farm.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { farmInputSchema, farmUpdateSchema } from "../../schemas/index.js";

const router = Router();

router.get("/farms", requireAuth, listFarms);
router.post("/farms", requireAuth, validateBody(farmInputSchema), createFarm);
router.get("/farms/:farmId", requireAuth, getFarm);
router.patch("/farms/:farmId", requireAuth, validateBody(farmUpdateSchema), updateFarm);
router.delete("/farms/:farmId", requireAuth, deleteFarm);

export default router;
