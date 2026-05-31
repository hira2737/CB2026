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
} = require("../Controllers/ReviewController");

// User review actions
router.post("/", authMiddleware, createReview);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Review routes working",
  });
});

router.get("/my-reviews", authMiddleware, getUserReviews);

// Public movie reviews
router.get("/movie/:movieId", getMovieReviews);

// Admin
router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllReviews
);

module.exports = router;