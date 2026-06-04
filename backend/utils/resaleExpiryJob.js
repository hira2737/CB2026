const ResaleListing = require("../Models/ResaleListing");
const Booking = require("../Models/Booking");
const { createNotification } = require("./notificationService");

const expireResaleListings = async () => {
  try {
    const cutoff = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Find active listings that have passed the cutoff
    const expiredListings = await ResaleListing.find({
      status: "active",
      showTime: { $lte: cutoff },
    });

    if (expiredListings.length === 0) return;

    for (const listing of expiredListings) {
      // Mark listing as expired
      await ResaleListing.findByIdAndUpdate(listing._id, {
        status: "expired",
        expiredAt: new Date(),
      });

      // Check if any other active listings exist for this booking
      const otherActive = await ResaleListing.countDocuments({
        bookingId: listing.bookingId,
        status: "active",
        _id: { $ne: listing._id },
      });

      // Restore booking to confirmed if no other active listings
      if (otherActive === 0) {
        await Booking.findByIdAndUpdate(listing.bookingId, {
          bookingStatus: "confirmed",
        });
      }

      // Notify seller
      await createNotification(
        listing.seller,
        "system",
        `Your resale listing for "${listing.movieTitle}" (seats: ${listing.seats.join(", ")}) expired without a sale. Your ticket remains valid.`,
        "/dashboard"
      );
    }

    console.log(
      `[ResaleExpiry] Expired ${expiredListings.length} listings at ${new Date().toISOString()}`
    );
  } catch (err) {
    console.error("[ResaleExpiry] Job error:", err.message);
  }
};

module.exports = expireResaleListings;