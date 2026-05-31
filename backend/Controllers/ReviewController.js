const Review = require("../Models/Review");
const Booking = require("../Models/Booking");

// ======================================================
// CREATE REVIEW
// ======================================================
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!bookingId || !numericRating) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and rating are required",
      });
    }

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: {
          path: "movie",
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not your booking",
      });
    }

    if (booking.isReviewed) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted",
      });
    }

    if (!booking.show?.movie?._id) {
      return res.status(400).json({
        success: false,
        message: "Booking is missing movie details",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      booking: booking._id,
      movie: booking.show.movie._id,
      rating: numericRating,
      comment,
    });

    booking.isReviewed = true;
    await booking.save();

    return res.status(201).json({
      success: true,
      review,
    });
  } catch (err) {
    console.error("createReview error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

// ======================================================
// GET MOVIE REVIEWS
// ======================================================
exports.getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;

    const reviews = await Review.find({
      movie: movieId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return res.json({
      success: true,
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (err) {
    console.error("getMovieReviews error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ======================================================
// USER REVIEWS
// ======================================================
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user.id,
    })
      .populate("movie", "title")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("getUserReviews error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// ======================================================
// ADMIN REVIEWS
// ======================================================
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("movie", "title")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("getAllReviews error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};
