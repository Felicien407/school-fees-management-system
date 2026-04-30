const express = require("express");
const { requireAuth, requireLibrarian } = require("../middleware/auth");
const borrowController = require("../controllers/borrowController");

const router = express.Router();

router.get("/", requireAuth, requireLibrarian, borrowController.listBorrows);
router.post("/", requireAuth, requireLibrarian, borrowController.createBorrow);
router.patch("/:id/return", requireAuth, requireLibrarian, borrowController.returnBorrow);

module.exports = router;
