const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    city: {
      type: String,
      required: true,
      enum: ["Chennai", "Mumbai", "Bangalore", "Delhi", "Hyderabad"],
      index: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * ⚡ INDEXES
 * Faster city-based filtering (important for UI listings)
 */
cinemaSchema.index({ city: 1, name: 1 });

module.exports = mongoose.model("Cinema", cinemaSchema);