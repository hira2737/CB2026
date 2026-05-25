const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../Controllers/CategoryController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", authMiddleware, adminMiddleware, addCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
