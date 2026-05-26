const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  paymentFailed,
  getBookingHistory,
  getBookedSeats,
  getAllBookings,
  getBookingById,
  getBookingByTransactionId,
} = require("../Controllers/BookingController");

const {
  lockSeats,
  unlockSeats,
} = require("../Controllers/SeatLockController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");

// ================= RAZORPAY BOOKING FLOW =================
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/payment-failed", authMiddleware, paymentFailed);

// ================= USER =================
router.get("/history", authMiddleware, getBookingHistory);
router.get("/transaction/:tranId", authMiddleware, getBookingByTransactionId);

// ================= ADMIN =================
router.get("/all", authMiddleware, adminMiddleware, getAllBookings);

// ================= SEATS =================
router.get("/booked-seats/:showId", getBookedSeats);
router.post("/lock", authMiddleware, lockSeats);
router.delete("/lock/:id", authMiddleware, unlockSeats);

// ================= SINGLE BOOKING =================
router.get("/:bookingId", authMiddleware, getBookingById);

module.exports = router;
