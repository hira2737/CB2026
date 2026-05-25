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
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // ✅ Razorpay additions (NEW)
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
  },
  {
    timestamps: true,
  }
);

/**
 * ⚡ PERFORMANCE INDEXES
 */

// show-based queries (seat checking, booked seats)
bookingSchema.index({ show: 1, bookingStatus: 1 });

// user history
bookingSchema.index({ user: 1, createdAt: -1 });

// payment callback lookup
bookingSchema.index({ transactionId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);