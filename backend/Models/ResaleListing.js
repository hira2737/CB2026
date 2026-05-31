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

    status: {
      type: String,
      enum: ["active", "sold", "expired", "cancelled"],
      default: "active",
    },

    soldAt: {
      type: Date,
      default: null,
    },

    listingMonth: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resaleListingSchema.index({ seller: 1, listingMonth: 1 });
resaleListingSchema.index({ status: 1, showTime: 1 });

module.exports = mongoose.model(
  "ResaleListing",
  resaleListingSchema
);