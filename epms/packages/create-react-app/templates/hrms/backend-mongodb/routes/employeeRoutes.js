import { Router } from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  create,
  getAll,
  getById,
  search,
  update,
  remove,
  getAvailableForUser,
  getMe,
  updateMe,
} from "../controllers/employeeController.js";

const router = Router();

router.get("/me", getMe);
router.put("/me", updateMe);

router.get("/search", requireAdmin, search);
router.get("/available-for-user", requireAdmin, getAvailableForUser);
router.get("/available-employees", requireAdmin, getAvailableForUser);
router.get("/", requireAdmin, getAll);
router.get("/:id", requireAdmin, getById);
router.post("/", requireAdmin, create);
router.put("/:id", requireAdmin, update);
router.delete("/:id", requireAdmin, remove);

export default router;
