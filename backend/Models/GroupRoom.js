const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userName: {
      type: String,
      trim: true,
    },

    userEmail: {
      type: String,
      trim: true,
    },

    claimedSeats: [
      {
        type: String,
      },
    ],

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    transactionId: {
      type: String,
      default: "",
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { _id: false }
);

const groupRoomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalSeats: [
      {
        type: String,
      },
    ],

    pricePerSeat: {
      type: Number,
      required: true,
    },

    members: [memberSchema],

    status: {
      type: String,
      enum: ["waiting", "partial", "completed", "expired"],
      default: "waiting",
    },

    seatLockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeatLock",
      default: null,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

groupRoomSchema.index({ roomCode: 1 });

module.exports = mongoose.model("GroupRoom", groupRoomSchema);