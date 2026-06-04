const mongoose = require("mongoose");

const resaleListingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      // REMOVED: unique: true - Now supports multiple resale listings per booking (partial seats)
      index: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Specific seats being resold from this booking
    seats: [
      {
        type: String,
      },
    ],

    seatKeys: [
      {
        type: String,
        index: true,
      },
    ],

    // Tracking original price per seat for commission calculation
    originalPrice: {
      type: Number,
      required: true,
    },

    // Price per seat for resale
    resalePrice: {
      type: Number,
      required: true,
    },

    sellerAmount: {
      type: Number,
      required: true,
    },

    platformCommission: {
      type: Number,
      required: true,
    },

    movieTitle: {
      type: String,
      required: true,
    },

    cinemaName: {
      type: String,
      required: true,
    },

    showTime: {
      type: Date,
      required: true,
    },

    seatCategory: {
      type: String,
      enum: ["PLATINUM", "GOLD", "SILVER", "MIXED"],
      required: true,
    },

    // ACTIVE | SOLD | EXPIRED | CANCELLED
    status: {
      type: String,
      enum: ["active", "sold", "expired", "cancelled"],
      default: "active",
    },

    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },

    soldAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    expiredAt: {
      type: Date,
      default: null,
    },

    // Month limit tracking (2 listings per month)
    listingMonth: {
      type: String,
      required: true,
    },

    // For audit history
    transferred: {
      type: Boolean,
      default: false,
    },

    transferBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES for performance and duplicate prevention
resaleListingSchema.index({ seller: 1, listingMonth: 1 });
resaleListingSchema.index({ status: 1, showTime: 1 });
resaleListingSchema.index({ buyer: 1 });
resaleListingSchema.index({ soldAt: 1 });

// Prevent duplicate resale listings for same seats
// Each value is `${bookingId}:${seat}` and must be unique while active/sold.
resaleListingSchema.index(
  { seatKeys: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["active", "sold"] },
      seatKeys: { $exists: true },
    },
  }
);

module.exports = mongoose.model(
  "ResaleListing",
  resaleListingSchema
);
