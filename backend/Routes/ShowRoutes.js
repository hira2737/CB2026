const express = require("express");
const router = express.Router();
const {
  getShows,
  getShowById,
  addShow,
  updateShow,
  deleteShow,
} = require("../Controllers/ShowController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

router.get("/", getShows);
router.get("/:id", getShowById);
router.post("/", authMiddleware, adminMiddleware, addShow);
router.put("/:id", authMiddleware, adminMiddleware, updateShow);
router.delete("/:id", authMiddleware, adminMiddleware, deleteShow);

module.exports = router;
