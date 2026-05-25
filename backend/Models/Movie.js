const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    releaseDate: {
      type: Date,
      required: true,
      index: true,
    },

    posterUrl: {
  type: String,
  default: "",
},

    backdropUrl: {
      type: String,
    },

    trailerUrl: {
      type: String,
    },

    genre: {
      type: [String],
      default: [],
      index: true,
    },

    language: {
      type: [String],
      default: ["English"],
    },

    formats: {
      type: [String],
      enum: ["2D", "3D", "IMAX", "4DX", "Dolby"],
      default: ["2D"],
    },

    status: {
      type: String,
      enum: ["Now Showing", "Coming Soon"],
      default: "Now Showing",
      index: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * ⚡ INDEXES FOR FAST QUERIES
 */

// homepage / listing speed
movieSchema.index({ status: 1, releaseDate: -1 });

// search optimization
// movieSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Movie", movieSchema);