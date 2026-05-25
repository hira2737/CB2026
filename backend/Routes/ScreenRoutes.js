const express = require("express");
const router = express.Router();
const {
  getScreens,
  addScreen,
  deleteScreen,
} = require("../Controllers/ScreenController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

router.get("/", getScreens);
router.post("/", authMiddleware, adminMiddleware, addScreen);
router.delete("/:id", authMiddleware, adminMiddleware, deleteScreen);

module.exports = router;
