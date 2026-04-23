import { Router } from "express";
import { ScreeningController } from "./screening.controller";

const router = Router();

// POST /screening/:jobId/screen
router.post("/:jobId/screen", ScreeningController.triggerScreening);

// GET /screening/:jobId
router.get("/:jobId", ScreeningController.getScreeningResults);

export default router;