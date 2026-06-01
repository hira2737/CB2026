const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../Models/Booking");
const ResaleListing = require("../Models/ResaleListing");
const Show = require("../Models/Show");
const razorpay = require("../config/RazorpayConfig");
const { createNotification } = require("../utils/notificationService");

const currentListingMonth = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"
const buildResaleTransactionId = () => `RSL-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

exports.createListing = async (req, res) => {
  try {
    const { bookingId, resalePrice } = req.body;
    const sellerId = req.user.id;

    if (!bookingId || !resalePrice) {
      return res.status(400).json({ success: false, message: "bookingId and resalePrice are required" });
    }

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      user: sellerId,
      bookingStatus: "confirmed",
    }).populate({ path: "show", populate: [{ path: "movie", select: "title" }, { path: "screen", populate: { path: "cinema", select: "name city" } }] });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found or not eligible for resale" });
    }

    const showStart = new Date(booking.show.startTime);
    if (showStart <= new Date(Date.now() + 3600000)) {
      return res.status(400).json({ success: false, message: "Resale is not allowed within 1 hour of show time" });
    }

    const original = booking.totalPrice;
    const minPrice = Math.ceil(original * 0.70);
    const maxPrice = Math.floor(original * 0.85);
    const parsedPrice = Number(resalePrice);

    if (isNaN(parsedPrice) || parsedPrice < minPrice || parsedPrice > maxPrice) {
      return res.status(400).json({
        success: false,
        message: `Resale price must be between ₹${minPrice} and ₹${maxPrice} (70%–85% of original ₹${original})`,
      });
    }

    const listingMonth = currentListingMonth();
    const monthCount = await ResaleListing.countDocuments({
      seller: sellerId,
      listingMonth,
      status: { $in: ["active", "sold"] },
    });
    if (monthCount >= 2) {
      return res.status(400).json({ success: false, message: "You have reached the limit of 2 resale listings per month" });
    }

    const sellerAmount = Math.round(parsedPrice * 0.90);
    const platformCommission = Math.round(parsedPrice * 0.10);

    const movieTitle = booking.show?.movie?.title || "Movie";
    const cinemaName = booking.show?.screen?.cinema
      ? `${booking.show.screen.cinema.name}, ${booking.show.screen.cinema.city}`
      : "Cinema";

    const listing = await ResaleListing.create({
      bookingId: booking._id,
      seller: sellerId,
      originalPrice: original,
      resalePrice: parsedPrice,
      sellerAmount,
      platformCommission,
      movieTitle,
      cinemaName,
      showTime: booking.show.startTime,
      seats: booking.seats,
      listingMonth,
    });

    await Booking.findByIdAndUpdate(booking._id, { bookingStatus: "resale_listed" });

    await createNotification(
      sellerId,
      "RESALE_LISTED",
      `Your ticket for "${movieTitle}" is now listed for resale.`,
      "/dashboard"
    );

    return res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error("createListing error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "This ticket is already listed for resale" });
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

    await ResaleListing.findByIdAndUpdate(listingId, { status: "cancelled" });
    await Booking.findByIdAndUpdate(listing.bookingId, { bookingStatus: "confirmed" });

    return res.json({ success: true, message: "Listing cancelled" });
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

    const listing = await ResaleListing.findById(listingId);
    if (!listing || listing.status !== "active") {
      return res.status(404).json({ success: false, message: "Listing no longer available" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const originalBooking = await Booking.findById(listing.bookingId)
      .populate({ path: "show", populate: { path: "movie", select: "title" } });

    if (!originalBooking) {
      return res.status(404).json({ success: false, message: "Original booking not found" });
    }

    const transactionId = buildResaleTransactionId();

    const newBooking = await Booking.create({
      user: buyerId,
      show: originalBooking.show._id,
      seats: originalBooking.seats,
      totalPrice: listing.resalePrice,
      paymentStatus: "paid",
      bookingStatus: "transferred_in",
      originalBookingId: originalBooking._id,
      transactionId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await Booking.findByIdAndUpdate(originalBooking._id, {
      bookingStatus: "transferred_out",
    });

    await ResaleListing.findByIdAndUpdate(listingId, {
      status: "sold",
      buyer: buyerId,
      soldAt: new Date(),
    });

    const movieTitle = originalBooking.show?.movie?.title || "Movie";

    await createNotification(
      listing.seller,
      "RESALE_SOLD",
      `Your resale ticket for "${movieTitle}" was sold. You earned ₹${listing.sellerAmount}.`,
      "/dashboard"
    );
    await createNotification(
      buyerId,
      "RESALE_BOUGHT",
      `You purchased a resale ticket for "${movieTitle}". Check your dashboard.`,
      "/dashboard"
    );

    return res.json({ success: true, bookingId: newBooking._id, transactionId });
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