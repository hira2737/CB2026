const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
      index: true,
    },

    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && new Set(v).size === v.length;
        },
        message: "Duplicate seats are not allowed in one booking",
      },
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "resale_listed",
        "resale_sold",
        "transferred_out",
        "transferred_in",
      ],
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    razorpayOrderId: {
      type: String,
      index: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },

    sessionKey: {
      type: String,
      index: true,
      sparse: true,
    },

    isReviewed: {
      type: Boolean,
      default: false,
      index: true,
    },

    originalBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    // For resale tracking
    isResaleBooking: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Track individual seat ownership for resale scenarios
    // Maps seat to user who owns it (used when booking is partially transferred)
    seatOwnership: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * PERFORMANCE INDEXES
 */

// show-based queries (seat checking, booked seats)
bookingSchema.index({ show: 1, bookingStatus: 1 });

// user history
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);