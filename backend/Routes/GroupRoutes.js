const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../Middlewares/AuthMiddleware");
const {
  createRoom,
  getRoom,
  claimSeats,
  createMemberOrder,
  verifyMemberPayment,
  releaseExpiredRoom,
  getAdminRooms,
} = require("../Controllers/GroupController");

const router = express.Router();

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAdminRooms
);

router.post("/create", authMiddleware, createRoom);
router.get("/:roomCode", authMiddleware, getRoom);
router.post("/:roomCode/claim", authMiddleware, claimSeats);
router.post("/:roomCode/pay", authMiddleware, createMemberOrder);
router.post("/:roomCode/verify", authMiddleware, verifyMemberPayment);
router.post("/:roomCode/release", releaseExpiredRoom);

module.exports = router;
