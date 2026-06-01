const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../Middlewares/AuthMiddleware");
const {
  createListing,
  getListings,
  getMyListings,
  cancelListing,
  createBuyOrder,
  verifyBuyPayment,
  getAllListingsAdmin,
} = require("../Controllers/ResaleController");

// IMPORTANT: specific named paths BEFORE parametric /:listingId
router.get("/",                        getListings);                                     // public
router.get("/mine",                    authMiddleware, getMyListings);
router.get("/admin/all",               authMiddleware, adminMiddleware, getAllListingsAdmin);
router.post("/list",                   authMiddleware, createListing);
router.delete("/:listingId",           authMiddleware, cancelListing);
router.post("/:listingId/buy-order",   authMiddleware, createBuyOrder);
router.post("/:listingId/verify",      authMiddleware, verifyBuyPayment);

module.exports = router;