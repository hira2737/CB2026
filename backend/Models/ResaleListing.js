const mongoose = require("mongoose");

const resaleListingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
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

    originalPrice: {
      type: Number,
      required: true,
    },

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

    seats: [
      {
        type: String,
      },
    ],

    seatCategory: {
      type: String,
      enum: ["PLATINUM", "GOLD", "SILVER"],
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

resaleListingSchema.index({ seller: 1, listingMonth: 1 });
resaleListingSchema.index({ status: 1, showTime: 1 });
resaleListingSchema.index({ buyer: 1 });
resaleListingSchema.index({ soldAt: 1 });

module.exports = mongoose.model(
  "ResaleListing",
  resaleListingSchema
);