const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/", requireAuth, studentController.listStudents);
router.get("/:id", requireAuth, studentController.getStudent);
router.post("/", requireAuth, requireAdmin, studentController.createStudent);
router.put("/:id", requireAuth, requireAdmin, studentController.updateStudent);
router.delete("/:id", requireAuth, requireAdmin, studentController.deleteStudent);

module.exports = router;
