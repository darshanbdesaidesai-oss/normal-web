import { Router } from "express";
import { getDashboardData } from "./dashboard.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/dashboard", requireAuth, getDashboardData);

export default router;
