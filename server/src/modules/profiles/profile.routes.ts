import { Router } from "express";
import { getProfile, updateProfile } from "./profile.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { profileUpdateSchema } from "../../schemas/index.js";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, validateBody(profileUpdateSchema), updateProfile);

export default router;
