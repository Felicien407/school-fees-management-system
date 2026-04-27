const express = require("express");
const requireAuth = require("../middleware/auth");
const salaryController = require("../controllers/salaryController");

const router = express.Router();

router.post("/", requireAuth, salaryController.createSalary);
router.get("/", requireAuth, salaryController.listSalaries);
router.put("/:id", requireAuth, salaryController.updateSalary);
router.delete("/:id", requireAuth, salaryController.deleteSalary);

module.exports = router;
