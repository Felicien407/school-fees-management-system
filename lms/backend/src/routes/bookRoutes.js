const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const bookController = require("../controllers/bookController");

const router = express.Router();

router.get("/", requireAuth, bookController.listBooks);
router.get("/:id", requireAuth, bookController.getBook);
router.post("/", requireAuth, requireAdmin, bookController.createBook);
router.put("/:id", requireAuth, requireAdmin, bookController.updateBook);
router.delete("/:id", requireAuth, requireAdmin, bookController.deleteBook);

module.exports = router;
