import { Router } from "express";
import { getReports, getOnLeaveReport } from "../controllers/reportController.js";

const router = Router();
router.get("/on-leave", getOnLeaveReport);
router.get("/", getReports);
export default router;
