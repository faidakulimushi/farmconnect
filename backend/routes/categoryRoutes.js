const express = require("express");
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { protect, authorise } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.post("/", protect, authorise("admin"), createCategory);
router.put("/:id", protect, authorise("admin"), updateCategory);
router.delete("/:id", protect, authorise("admin"), deleteCategory);

module.exports = router;
