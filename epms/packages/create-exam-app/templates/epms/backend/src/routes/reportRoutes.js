const express = require("express");
const requireAuth = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.get("/monthly-payroll", requireAuth, reportController.monthlyPayroll);

module.exports = router;
