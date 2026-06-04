const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../Models/Booking");
const ResaleListing = require("../Models/ResaleListing");
const Show = require("../Models/Show");
const razorpay = require("../config/RazorpayConfig");
const { createNotification } = require("../utils/notificationService");

const currentListingMonth = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"
const buildResaleTransactionId = () => `RSL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const getSeatPricing = (seat) => {
  const row = String(seat || "")[0]?.toUpperCase();

  if (["A", "B"].includes(row)) {
    return { category: "PLATINUM", original: 360, resale: 235 };
  }

  if (["C", "D", "E", "F"].includes(row)) {
    return { category: "GOLD", original: 270, resale: 175 };
  }

  if (["G", "H", "I", "J"].includes(row)) {
    return { category: "SILVER", original: 180, resale: 115 };
  }

  return null;
};

exports.createListing = async (req, res) => {
  try {
    const { bookingId, selectedSeats: rawSelectedSeats } = req.body;
    const sellerId = req.user.id;

    // ========== VALIDATION ==========
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "bookingId is required" });
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    if (!Array.isArray(rawSelectedSeats) || rawSelectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one seat to resale" });
    }

    const selectedSeats = [
      ...new Set(
        rawSelectedSeats
          .map((seat) => String(seat || "").trim().toUpperCase())
          .filter(Boolean)
      ),
    ];

    if (selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one valid seat to resale" });
    }

    // ========== FETCH BOOKING ==========
    const booking = await Booking.findOne({
      _id: bookingId,
      user: sellerId,
      bookingStatus: { $in: ["confirmed", "resale_listed"] },
    }).populate({ path: "show", populate: [{ path: "movie", select: "title" }, { path: "screen", populate: { path: "cinema", select: "name city" } }] });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or not eligible for resale" });
    }

    // ========== VERIFY SELECTED SEATS EXIST IN BOOKING ==========
    const bookingSeats = booking.seats || [];
    const invalidSeats = selectedSeats.filter(seat => !bookingSeats.includes(seat));

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid seats: ${invalidSeats.join(", ")}. These seats are not in your booking.`
      });
    }

    // ========== PREVENT DUPLICATE RESALE LISTINGS FOR SAME SEATS ==========
    const existingListing = await ResaleListing.findOne({
      bookingId,
      seats: { $in: selectedSeats },
      status: { $in: ["active", "sold"] },
    });

    if (existingListing) {
      return res.status(400).json({
        success: false,
        message: `Seats ${selectedSeats.join(", ")} are already listed for resale`
      });
    }

    // ========== TIME CHECK ==========
    const showStart = new Date(booking.show.startTime);
    if (showStart <= new Date(Date.now() + 3600000)) {
      return res.status(400).json({ success: false, message: "Resale is not allowed within 1 hour of show time" });
    }

    // ========== CALCULATE PRICING PER SELECTED SEAT ==========
    const seatCount = selectedSeats.length;
    const pricingRows = selectedSeats.map(getSeatPricing);

    if (pricingRows.some((item) => !item)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat category selected",
      });
    }

    const categorySet = new Set(pricingRows.map((item) => item.category));
    const seatCategory =
      categorySet.size === 1 ? pricingRows[0].category : "MIXED";
    const totalOriginalPrice = pricingRows.reduce(
      (sum, item) => sum + item.original,
      0
    );
    const totalResalePrice = pricingRows.reduce(
      (sum, item) => sum + item.resale,
      0
    );
    const PLATFORM_COMMISSION_RATE = 0.10;
    const platformCommission = Math.round(totalResalePrice * PLATFORM_COMMISSION_RATE);
    const sellerAmount = totalResalePrice - platformCommission;

    // ========== MONTHLY LISTING LIMIT (2 listings per month) ==========
    const listingMonth = currentListingMonth();
    const monthCount = await ResaleListing.countDocuments({
      seller: sellerId,
      listingMonth,
      status: { $in: ["active", "sold"] },
    });

    if (monthCount >= 2) {
      return res.status(400).json({ success: false, message: "You have reached the limit of 2 resale listings per month" });
    }

    // ========== BUILD LISTING ==========
    const movieTitle = booking.show?.movie?.title || "Movie";
    const cinemaName = booking.show?.screen?.cinema
      ? `${booking.show.screen.cinema.name}, ${booking.show.screen.cinema.city}`
      : "Cinema";

    const seatKeys = selectedSeats.map((seat) => `${booking._id}:${seat}`);

    const listing = await ResaleListing.create({
      bookingId: booking._id,
      seller: sellerId,
      seats: selectedSeats,
      seatKeys,
      originalPrice: totalOriginalPrice,
      resalePrice: totalResalePrice,
      sellerAmount,
      platformCommission,
      movieTitle,
      cinemaName,
      showTime: booking.show.startTime,
      listingMonth,
      seatCategory,
    });

    // ========== UPDATE BOOKING STATUS ==========
    await Booking.findByIdAndUpdate(booking._id, {
      bookingStatus: "resale_listed"
    });

    // ========== CREATE NOTIFICATION ==========
    await createNotification(
      sellerId,
      "system",
      `Your ${seatCount} ticket(s) for "${movieTitle}" (${selectedSeats.join(", ")}) is now listed for resale.`,
      "/dashboard"
    );

    return res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error("createListing error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "One or more selected seats are already listed for resale" });
    }
    return res.status(500).json({ success: false, message: "Failed to create listing" });
  }
};

exports.getListings = async (req, res) => {
  try {
    const listings = await ResaleListing.find({
      status: "active",
      showTime: { $gt: new Date(Date.now() + 3600000) },
    })
      .populate("seller", "name")
      .sort({ showTime: 1 });

    return res.json({ success: true, listings });
  } catch (err) {
    console.error("getListings error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await ResaleListing.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    return res.json({ success: true, listings });
  } catch (err) {
    console.error("getMyListings error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch your listings" });
  }
};

exports.cancelListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await ResaleListing.findOne({
      _id: listingId,
      seller: req.user.id,
      status: "active",
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: "Active listing not found" });
    }

    // ========== UPDATE LISTING STATUS ==========
    await ResaleListing.findByIdAndUpdate(listingId, {
      status: "cancelled",
      cancelledAt: new Date(),
    });

    // ========== REVERT BOOKING STATUS ONLY IF NO OTHER ACTIVE RESALE LISTINGS ==========
    const otherActiveListings = await ResaleListing.countDocuments({
      bookingId: listing.bookingId,
      status: "active",
      _id: { $ne: listingId },
    });

    if (otherActiveListings === 0) {
      await Booking.findByIdAndUpdate(listing.bookingId, { bookingStatus: "confirmed" });
    }

    // ========== CREATE NOTIFICATION ==========
    await createNotification(
      req.user.id,
      "system",
      `Your resale listing for seats ${listing.seats.join(", ")} in "${listing.movieTitle}" has been cancelled.`,
      "/dashboard"
    );

    return res.json({ success: true, message: "Listing cancelled successfully" });
  } catch (err) {
    console.error("cancelListing error:", err);
    return res.status(500).json({ success: false, message: "Failed to cancel listing" });
  }
};

exports.createBuyOrder = async (req, res) => {
  try {
    const { listingId } = req.params;
    const buyerId = req.user.id;

    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ success: false, message: "Invalid listing ID" });
    }

    const listing = await ResaleListing.findById(listingId);

    if (!listing || listing.status !== "active") {
      return res.status(404).json({ success: false, message: "Listing not available" });
    }

    if (listing.seller.toString() === buyerId) {
      return res.status(400).json({ success: false, message: "You cannot buy your own listing" });
    }

    if (listing.showTime <= new Date(Date.now() + 3600000)) {
      return res.status(400).json({ success: false, message: "Show is too close to allow resale purchase" });
    }

    const receiptId = buildResaleTransactionId();

    const order = await razorpay.orders.create({
      amount: Math.round(listing.resalePrice * 100),
      currency: "INR",
      receipt: receiptId,
      notes: { listingId: listing._id.toString(), buyerId, type: "resale" },
    });

    await ResaleListing.findByIdAndUpdate(listingId, { razorpayOrderId: order.id });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      listing: {
        movieTitle: listing.movieTitle,
        cinemaName: listing.cinemaName,
        seats: listing.seats,
        resalePrice: listing.resalePrice,
      },
    });
  } catch (err) {
    console.error("createBuyOrder error:", err);
    return res.status(500).json({ success: false, message: "Failed to create buy order" });
  }
};

exports.verifyBuyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const { listingId } = req.params;
    const buyerId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment data" });
    }

    // ========== FETCH & VERIFY LISTING ==========
    const listing = await ResaleListing.findById(listingId);
    if (!listing || listing.status !== "active") {
      return res.status(404).json({ success: false, message: "Listing no longer available" });
    }

    // ========== VERIFY SIGNATURE ==========
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ========== FETCH ORIGINAL BOOKING ==========
    const originalBooking = await Booking.findById(listing.bookingId)
      .populate({ path: "show", populate: { path: "movie", select: "title" } });

    if (!originalBooking) {
      return res.status(404).json({ success: false, message: "Original booking not found" });
    }

    // ========== COLLISION PREVENTION: Check if seats already sold ==========
    const conflictingListing = await ResaleListing.findOne({
      bookingId: listing.bookingId,
      seats: { $in: listing.seats },
      status: "sold",
      _id: { $ne: listingId },
    });

    if (conflictingListing) {
      return res.status(409).json({
        success: false,
        message: "Seat is no longer available",
      });
    }

    const claimedListing = await ResaleListing.findOneAndUpdate(
      {
        _id: listingId,
        status: "active",
        showTime: { $gt: new Date(Date.now() + 3600000) },
      },
      {
        $set: {
          status: "sold",
          buyer: buyerId,
          soldAt: new Date(),
          transferred: true,
        },
      },
      { new: true }
    );

    if (!claimedListing) {
      return res.status(409).json({
        success: false,
        message: "Seat is no longer available",
      });
    }

    // ========== CREATE NEW BOOKING FOR BUYER (with only resold seats) ==========
    const transactionId = buildResaleTransactionId();

    const newBooking = await Booking.create({
      user: buyerId,
      show: originalBooking.show._id,
      seats: listing.seats,
      totalPrice: listing.resalePrice,
      transactionId,
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      isResaleBooking: true,
      originalBookingId: originalBooking._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    // ========== UPDATE ORIGINAL BOOKING OWNERSHIP ==========
    const remainingSeats = (originalBooking.seats || []).filter(
      (seat) => !listing.seats.includes(seat)
    );

    const otherActiveListings = await ResaleListing.countDocuments({
      bookingId: originalBooking._id,
      status: "active",
    });

    await Booking.findByIdAndUpdate(originalBooking._id, {
      seats: remainingSeats,
      bookingStatus:
        remainingSeats.length === 0
          ? "transferred_out"
          : otherActiveListings > 0
          ? "resale_listed"
          : "confirmed",
    });

    await ResaleListing.findByIdAndUpdate(listingId, {
      transferBookingId: newBooking._id,
    });

    // ========== CREATE NOTIFICATIONS ==========
    const movieTitle = originalBooking.show?.movie?.title || "Movie";
    const seatsDisplay = listing.seats.join(", ");

    await createNotification(
      listing.seller,
      "system",
      `Your resale ticket for "${movieTitle}" (${seatsDisplay}) was sold. You earned ₹${listing.sellerAmount}. Platform fee: ₹${listing.platformCommission}.`,
      "/dashboard"
    );

    await createNotification(
      buyerId,
      "booking",
      `You purchased a resale ticket for "${movieTitle}" (${seatsDisplay}) for ₹${listing.resalePrice}. Check your dashboard.`,
      "/dashboard"
    );

    return res.json({
      success: true,
      bookingId: newBooking._id,
      transactionId,
    });
  } catch (err) {
    console.error("verifyBuyPayment error:", err);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

exports.getAllListingsAdmin = async (req, res) => {
  try {
    const listings = await ResaleListing.find()
      .populate("seller", "name email")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    const totalCommission = listings
      .filter((l) => l.status === "sold")
      .reduce((sum, l) => sum + (l.platformCommission || 0), 0);

    return res.json({
      success: true,
      listings,
      stats: {
        totalCommission,
        totalSold: listings.filter((l) => l.status === "sold").length,
        totalActive: listings.filter((l) => l.status === "active").length,
        totalExpired: listings.filter((l) => l.status === "expired").length,
        totalCancelled: listings.filter((l) => l.status === "cancelled").length,
      },
    });
  } catch (err) {
    console.error("getAllListingsAdmin error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch admin listings" });
  }
};
