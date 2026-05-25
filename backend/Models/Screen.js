const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          // ensure no duplicate seats in screen definition
          return Array.isArray(v) && new Set(v).size === v.length;
        },
        message: "Duplicate seats are not allowed in screen layout",
      },
    },
  },
  { timestamps: true }
);

/**
 * ⚡ INDEXES
 */
screenSchema.index({ cinema: 1, name: 1 });

module.exports = mongoose.model("Screen", screenSchema);