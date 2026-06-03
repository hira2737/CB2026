const ResaleListing = require("../Models/ResaleListing");

const expireResaleListings = async () => {
  try {
    const now = new Date();

    const cutoff = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour rule

    const result = await ResaleListing.updateMany(
      {
        status: "active",
        showTime: { $lte: cutoff },
      },
      {
        status: "expired",
        expiredAt: new Date(),
      }
    );

    console.log(`Expired listings updated: ${result.modifiedCount}`);
  } catch (err) {
    console.error("Expiry job error:", err);
  }
};

module.exports = expireResaleListings;