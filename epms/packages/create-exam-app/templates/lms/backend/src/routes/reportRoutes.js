const express = require("express");
const { requireAuth } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.get("/students", requireAuth, reportController.allStudents);
router.get("/books", requireAuth, reportController.allBooks);
router.get("/borrowed", requireAuth, reportController.borrowedReport);
router.get("/returned", requireAuth, reportController.returnedReport);

module.exports = router;
