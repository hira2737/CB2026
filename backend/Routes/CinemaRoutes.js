const express = require("express");
const router = express.Router();
const {
  getCinemas,
  addCinema,
  deleteCinema,
  updateCinema,
} = require("../Controllers/CinemaController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

router.get("/", getCinemas);
router.post("/", authMiddleware, adminMiddleware, addCinema);
router.put("/:id", authMiddleware, adminMiddleware, updateCinema);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCinema);

module.exports = router;
