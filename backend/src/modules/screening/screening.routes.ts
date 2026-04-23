import { Router } from "express";
import { ScreeningController } from "./screening.controller";
import { requireApiKey } from "../../middleware/apiKey";

const router = Router();

// POST /screening/:jobId/screen (protected by x-api-key if configured)
router.post("/:jobId/screen", requireApiKey, ScreeningController.triggerScreening);

// GET /screening/:jobId
router.get("/:jobId", ScreeningController.getScreeningResults);

export default router;