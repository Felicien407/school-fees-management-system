import { Router } from "express";
import { create, getAll } from "../controllers/positionController.js";

const router = Router();
router.post("/", create);
router.get("/", getAll);
export default router;
