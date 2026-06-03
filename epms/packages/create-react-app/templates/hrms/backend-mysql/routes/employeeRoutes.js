import { Router } from "express";
import { create, getAll, getById, search, update, remove, getAvailableForUser } from "../controllers/employeeController.js";

const router = Router();
router.get("/search", search);
router.get("/available-for-user", getAvailableForUser);
router.get("/available-employees", getAvailableForUser);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
export default router;
