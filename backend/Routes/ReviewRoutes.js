const express = require("express");
const router = express.Router();

const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

const {
  createReview,
  getMovieReviews,
  getUserReviews,
  getAllReviews,
  deleteReview,
} = require("../Controllers/ReviewController");

// Create review (logged-in users only)
router.post("/", authMiddleware, createReview);

// Get current user's reviews
router.get("/my-reviews", authMiddleware, getUserReviews);

// Get all reviews for a movie (public)
router.get("/movie/:movieId", getMovieReviews);

// Admin: get all reviews
router.get("/admin/all", authMiddleware, adminMiddleware, getAllReviews);

// Admin: delete a review
router.delete("/:reviewId", authMiddleware, adminMiddleware, deleteReview);

module.exports = router;