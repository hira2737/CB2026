const express = require("express");
const router = express.Router();

const {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
} = require("../Controllers/MovieController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

const { upload } = require("../config/CloudinaryConfig");

// Public routes
router.get("/", getMovies);
router.get("/:id", getMovieById);

// Admin routes (Cloudinary upload OR URL both supported)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("poster"),
  addMovie
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("poster"),
  updateMovie
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteMovie
);

module.exports = router;