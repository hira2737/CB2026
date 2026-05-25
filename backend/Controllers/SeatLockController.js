const SeatLock = require("../Models/SeatLock");
const Booking = require("../Models/Booking");
const Show = require("../Models/Show");

// ===============================
// LOCK SEATS
// ===============================
exports.lockSeats = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.user.id;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: "showId and seats are required",
      });
    }

    const activeShow = await Show.findOne({
      _id: showId,
      isActive: true,
      startTime: { $gte: new Date() },
    });

    if (!activeShow) {
      return res.status(400).json({
        message: "Show is no longer available for booking",
      });
    }

    // =========================================
    // 1. Check already confirmed bookings
    // =========================================
    const existingBooking = await Booking.findOne({
      show: showId,
      seats: { $in: seats },
      bookingStatus: "confirmed",
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "One or more seats are already booked",
      });
    }

    // =========================================
    // 2. Check active locks by OTHER users
    // =========================================
    const otherUserLock = await SeatLock.findOne({
      show: showId,
      seats: { $in: seats },
      user: { $ne: userId },
      expiresAt: { $gt: new Date() },
    });

    if (otherUserLock) {
      return res.status(400).json({
        message: "One or more seats are temporarily locked by another user",
      });
    }

    // =========================================
    // 3. Create/update lock ATOMICALLY
    // =========================================
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const lock = await SeatLock.findOneAndUpdate(
      { show: showId, user: userId },
      {
        $set: {
          show: showId,
          user: userId,
          seats,
          expiresAt,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      message: "Seats locked successfully",
      lockId: lock._id,
      expiresAt: lock.expiresAt,
    });
  } catch (error) {
    // Duplicate key protection
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Seat lock already in progress. Please wait a moment.",
      });
    }

    console.error("lockSeats error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// UNLOCK SEATS
// ===============================
exports.unlockSeats = async (req, res) => {
  try {
    await SeatLock.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    return res.json({
      message: "Seats unlocked",
    });
  } catch (error) {
    console.error("unlockSeats error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
