import { Router } from "express";
import { listCrops, getCropCategories, getCrop } from "./crop.controller.js";

const router = Router();

router.get("/crops", listCrops);
router.get("/crops/categories", getCropCategories);
router.get("/crops/:cropId", getCrop);

export default router;
