const Booking = require("../Models/Booking");
const SeatLock = require("../Models/SeatLock");
const razorpay = require("../config/RazorpayConfig");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const {
  sendBookingConfirmation,
  sendAdminNotification,
} = require("../Services/EmailService");

// ======================================================
// CREATE ORDER
// ======================================================
exports.createOrder = async (req, res) => {
  try {
    const { showId, seats, totalPrice, movieTitle } = req.body;

    const userId = req.user.id;

    // VALIDATION
    if (
      !showId ||
      !Array.isArray(seats) ||
      seats.length === 0 ||
      !totalPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // VERIFY ACTIVE SEAT LOCK
    const activeLock = await SeatLock.findOne({
      show: showId,
      user: userId,
      seats: { $all: seats },
      expiresAt: { $gt: new Date() },
    });

    if (!activeLock) {
      return res.status(400).json({
        success: false,
        message:
          "Seat lock expired. Please select seats again.",
      });
    }

    // DOUBLE CHECK IF SEATS ALREADY BOOKED
    const existingBooking = await Booking.findOne({
      show: showId,
      seats: { $in: seats },
      bookingStatus: "confirmed",
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Some seats already booked",
      });
    }

    // GENERATE TRANSACTION ID
    const transactionId = `TXN-${uuidv4()
      .substring(0, 8)
      .toUpperCase()}`;

    // CREATE RAZORPAY ORDER
    const order = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      receipt: transactionId,
      notes: {
        userId,
        showId,
        seats: seats.join(","),
        movieTitle,
      },
    });

    // CREATE PENDING BOOKING
    await Booking.create({
      user: userId,
      show: showId,
      seats,
      totalPrice,
      transactionId,
      razorpayOrderId: order.id,
      paymentStatus: "pending",
      bookingStatus: "pending",
    });

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionId,
    });
  } catch (err) {
    console.error("createOrder error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// ======================================================
// VERIFY PAYMENT
// ======================================================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

    // VALIDATION
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !transactionId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment data",
      });
    }

    // FIND BOOKING
    const existingBooking = await Booking.findOne({
      transactionId,
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // PREVENT DOUBLE PAYMENT VERIFICATION
    if (
      existingBooking.paymentStatus === "paid" &&
      existingBooking.bookingStatus === "confirmed"
    ) {
      return res.json({
        success: true,
        transactionId: existingBooking.transactionId,
      });
    }

    // VERIFY SIGNATURE
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // INVALID SIGNATURE
    if (generatedSignature !== razorpay_signature) {
      await Booking.findOneAndUpdate(
        { transactionId },
        {
          paymentStatus: "failed",
          bookingStatus: "cancelled",
        }
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // FINAL SAFETY CHECK
    const seatConflict = await Booking.findOne({
      _id: { $ne: existingBooking._id },
      show: existingBooking.show,
      seats: { $in: existingBooking.seats },
      bookingStatus: "confirmed",
    });

    if (seatConflict) {
      await Booking.findOneAndUpdate(
        { transactionId },
        {
          paymentStatus: "failed",
          bookingStatus: "cancelled",
        }
      );

      return res.status(409).json({
        success: false,
        message:
          "Seats already booked by another user",
      });
    }

    // CONFIRM BOOKING
    const booking = await Booking.findOneAndUpdate(
      { transactionId },
      {
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    )
      .populate("user", "name email")
      .populate({
        path: "show",
        populate: [
          { path: "movie" },
          {
            path: "screen",
            populate: {
              path: "cinema",
            },
          },
        ],
      });

    // RELEASE LOCKS
    await SeatLock.deleteMany({
      user: booking.user._id,
      show: booking.show._id,
    });

    // SEND EMAILS
    try {
      const details = {
        transactionId: booking.transactionId,
        movieTitle: booking.show.movie.title,
        seats: booking.seats.join(", "),
        totalPrice: booking.totalPrice,
        userName: booking.user.name,
        userEmail: booking.user.email,
      };

      await sendBookingConfirmation(
        booking.user.email,
        details
      );

      await sendAdminNotification(details);
    } catch (emailErr) {
      console.error(
        "Email sending failed:",
        emailErr.message
      );
    }

    return res.json({
      success: true,
      transactionId: booking.transactionId,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// ======================================================
// GET BOOKING BY TRANSACTION ID
// ======================================================
exports.getBookingByTransactionId = async (
  req,
  res
) => {
  try {
    // ROUTE PARAM: :tranId
    const { tranId } = req.params;

    if (!tranId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const booking = await Booking.findOne({
      transactionId: tranId,
    })
      .populate("user", "name email")
      .populate({
        path: "show",
        populate: [
          { path: "movie" },
          {
            path: "screen",
            populate: {
              path: "cinema",
            },
          },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.json(booking);
  } catch (err) {
    console.error(
      "getBookingByTransactionId error:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// ======================================================
// PAYMENT FAILED
// ======================================================
exports.paymentFailed = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (transactionId) {
      await Booking.findOneAndUpdate(
        { transactionId },
        {
          paymentStatus: "failed",
          bookingStatus: "cancelled",
        }
      );
    }

    return res.json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// USER BOOKING HISTORY
// ======================================================
exports.getBookingHistory = async (
  req,
  res
) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    })
      .populate({
        path: "show",
        populate: [
          {
            path: "movie",
            populate: {
              path: "category",
            },
          },
          {
            path: "screen",
            populate: {
              path: "cinema",
            },
          },
        ],
      })
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// GET BOOKED SEATS
// ======================================================
exports.getBookedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const confirmedBookings =
      await Booking.find({
        show: showId,
        bookingStatus: "confirmed",
      });

    const activeLocks = await SeatLock.find({
      show: showId,
      expiresAt: { $gt: new Date() },
    });

    const bookedSeats = [
      ...new Set([
        ...confirmedBookings.flatMap(
          (b) => b.seats
        ),
        ...activeLocks.flatMap(
          (l) => l.seats
        ),
      ]),
    ];

    return res.json(bookedSeats);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// ADMIN BOOKINGS
// ======================================================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "show",
        populate: [
          {
            path: "movie",
            populate: {
              path: "category",
            },
          },
          {
            path: "screen",
            populate: {
              path: "cinema",
            },
          },
        ],
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ======================================================
// LEGACY COMPATIBILITY
// ======================================================
exports.initiateBooking = exports.createOrder;

exports.paymentSuccess = async (
  req,
  res
) => {
  return res.status(400).json({
    success: false,
    message:
      "Legacy paymentSuccess disabled. Use verifyPayment.",
  });
};

exports.paymentFail = async (
  req,
  res
) => {
  return res.status(400).json({
    success: false,
    message:
      "Legacy paymentFail disabled.",
  });
};

exports.paymentCancel = async (
  req,
  res
) => {
  return res.status(400).json({
    success: false,
    message:
      "Legacy paymentCancel disabled.",
  });
};
