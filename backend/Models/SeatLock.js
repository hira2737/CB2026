const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seats: [{ type: String, required: true }],
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL — auto-deletes expired locks
    },
  },
  { timestamps: true }
);

// Unique compound index: one user can only hold ONE lock per show at a time.
// This prevents the race condition where two requests from the same user
// both pass the check and both insert a lock.
seatLockSchema.index({ show: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("SeatLock", seatLockSchema);