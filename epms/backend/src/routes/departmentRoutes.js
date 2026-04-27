const express = require("express");
const requireAuth = require("../middleware/auth");
const departmentController = require("../controllers/departmentController");

const router = express.Router();

router.post("/", requireAuth, departmentController.createDepartment);
router.get("/", requireAuth, departmentController.listDepartments);
router.post("/seed", requireAuth, departmentController.seedDepartments);

module.exports = router;
