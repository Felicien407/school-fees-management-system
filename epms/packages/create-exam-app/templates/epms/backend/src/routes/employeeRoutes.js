const express = require("express");
const requireAuth = require("../middleware/auth");
const employeeController = require("../controllers/employeeController");

const router = express.Router();

router.post("/", requireAuth, employeeController.createEmployee);
router.get("/", requireAuth, employeeController.listEmployees);

module.exports = router;
