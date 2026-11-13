import { Router } from "express";
import {
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} from "./activity.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { activityInputSchema, activityUpdateSchema } from "../../schemas/index.js";

const router = Router();

router.get("/activities", requireAuth, listActivities);
router.post("/activities", requireAuth, validateBody(activityInputSchema), createActivity);
router.get("/activities/:id", requireAuth, getActivity);
router.patch("/activities/:id", requireAuth, validateBody(activityUpdateSchema), updateActivity);
router.delete("/activities/:id", requireAuth, deleteActivity);

export default router;
