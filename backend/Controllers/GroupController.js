const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../Models/Booking");
const GroupRoom = require("../Models/GroupRoom");
const SeatLock = require("../Models/SeatLock");
const Show = require("../Models/Show");
const razorpay = require("../config/RazorpayConfig");
const { createNotification } = require("../utils/notificationService");

const ROOM_TTL_MINUTES = 15;
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const getSeatPrice = (seat) => {
  const row = String(seat || "")[0]?.toUpperCase();

  if (["A", "B"].includes(row)) return 360;
  if (["C", "D", "E", "F"].includes(row)) return 270;
  if (["G", "H", "I", "J"].includes(row)) return 180;

  return 0;
};

const buildTransactionId = () =>
  `GRP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const buildRoomCode = () =>
  Array.from({ length: 6 }, () =>
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  ).join("");

const createUniqueRoomCode = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const roomCode = buildRoomCode();
    const exists = await GroupRoom.exists({ roomCode });

    if (!exists) return roomCode;
  }

  throw new Error("Unable to generate room code");
};

const getCurrentUserMember = (room, userId) =>
  room.members.find(
    (member) => member.userId?.toString() === userId
  );

const sanitizeMembers = (members = []) =>
  members.map((member) => ({
    userName: member.userName,
    claimedSeats: member.claimedSeats,
    paymentStatus: member.paymentStatus,
    bookingId: member.bookingId,
  }));

const buildSeatMap = (room, userId) =>
  room.totalSeats.map((seat) => {
    const member = room.members.find((item) =>
      item.claimedSeats.includes(seat)
    );

    return {
      seat,
      claimedBy: member?.userName || null,
      paymentStatus: member ? member.paymentStatus : "unclaimed",
      isYours: member?.userId?.toString() === userId,
    };
  });

const formatRoomResponse = (room, userId) => ({
  roomCode: room.roomCode,
  showId: room.showId,
  totalSeats: room.totalSeats,
  pricePerSeat: room.pricePerSeat,
  status: room.status,
  expiresAt: room.expiresAt,
  secondsLeft: Math.max(
    0,
    Math.floor((room.expiresAt.getTime() - Date.now()) / 1000)
  ),
  seatMap: buildSeatMap(room, userId),
  members: sanitizeMembers(room.members),
});

exports.createRoom = async (req, res) => {
  try {
    const { showId, seats } = req.body;

    if (!mongoose.isValidObjectId(showId) || !Array.isArray(seats)) {
      return res.status(400).json({
        success: false,
        message: "Valid show and seats are required",
      });
    }

    if (seats.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Select at least 2 seats",
      });
    }

    const uniqueSeats = [...new Set(seats)];

    if (uniqueSeats.length !== seats.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate seats are not allowed",
      });
    }

    const seatPrices = uniqueSeats.map(getSeatPrice);

    if (seatPrices.some((price) => price <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat category",
      });
    }

    if (new Set(seatPrices).size !== 1) {
      return res.status(400).json({
        success: false,
        message: "Split booking supports one seat category at a time",
      });
    }

    const activeLock = await SeatLock.findOne({
      show: showId,
      user: req.user.id,
      seats: { $all: uniqueSeats },
      expiresAt: { $gt: new Date() },
    });

    if (!activeLock) {
      return res.status(400).json({
        success: false,
        message: "Seat lock expired. Please select seats again.",
      });
    }

    const show = await Show.findOne({
      _id: showId,
      isActive: true,
      startTime: { $gt: new Date() },
    });

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not available",
      });
    }

    const expiresAt = new Date(
      Date.now() + ROOM_TTL_MINUTES * 60 * 1000
    );
    const roomCode = await createUniqueRoomCode();

    await SeatLock.findByIdAndUpdate(activeLock._id, { expiresAt });

    const room = await GroupRoom.create({
      roomCode,
      showId,
      leaderId: req.user.id,
      totalSeats: uniqueSeats,
      pricePerSeat: seatPrices[0],
      seatLockId: activeLock._id,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      roomCode: room.roomCode,
      expiresAt: room.expiresAt,
      totalSeats: room.totalSeats,
      pricePerSeat: room.pricePerSeat,
    });
  } catch (error) {
    console.error("createRoom error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create group room",
    });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await GroupRoom.findOne({
      roomCode: req.params.roomCode?.toUpperCase(),
    }).populate({
      path: "showId",
      select: "startTime movie screen",
      populate: [
        { path: "movie", select: "title" },
        {
          path: "screen",
          select: "name cinema",
          populate: { path: "cinema", select: "name address" },
        },
      ],
    });

    if (!room || room.expiresAt <= new Date()) {
      return res.status(404).json({
        success: false,
        message: "Room expired or not found",
      });
    }

    return res.json({
      success: true,
      room: formatRoomResponse(room, req.user.id),
    });
  } catch (error) {
    console.error("getRoom error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch group room",
    });
  }
};

exports.claimSeats = async (req, res) => {
  try {
    const roomCode = req.params.roomCode?.toUpperCase();
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const seats = Array.isArray(req.body.seats)
      ? [...new Set(req.body.seats)]
      : [];

    if (!seats.length) {
      return res.status(400).json({
        success: false,
        message: "Select seats to claim",
      });
    }

    const baseFilter = {
      roomCode,
      expiresAt: { $gt: new Date() },
      totalSeats: { $all: seats },
      members: {
        $not: {
          $elemMatch: {
            userId: { $ne: userObjectId },
            claimedSeats: { $in: seats },
          },
        },
      },
    };

    const updateExisting = await GroupRoom.findOneAndUpdate(
      {
        ...baseFilter,
        "members.userId": userObjectId,
      },
      {
        $set: {
          "members.$.claimedSeats": seats,
          "members.$.paymentStatus": "pending",
          status: "partial",
        },
      },
      { new: true }
    );

    if (updateExisting) {
      return res.json({
        success: true,
        message: "Seats claimed.",
      });
    }

    const updatedRoom = await GroupRoom.findOneAndUpdate(
      baseFilter,
      {
        $push: {
          members: {
            userId: userObjectId,
            userName: req.user.name || "Friend",
            userEmail: req.user.email || "",
            claimedSeats: seats,
            paymentStatus: "pending",
          },
        },
        $set: { status: "partial" },
      },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(400).json({
        success: false,
        message: "Seats are no longer available to claim",
      });
    }

    return res.json({
      success: true,
      message: "Seats claimed.",
    });
  } catch (error) {
    console.error("claimSeats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to claim seats",
    });
  }
};

exports.createMemberOrder = async (req, res) => {
  try {
    const room = await GroupRoom.findOne({
      roomCode: req.params.roomCode?.toUpperCase(),
      expiresAt: { $gt: new Date() },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room expired or not found",
      });
    }

    const member = getCurrentUserMember(room, req.user.id);

    if (!member?.claimedSeats?.length) {
      return res.status(400).json({
        success: false,
        message: "Claim seats before payment",
      });
    }

    if (member.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Seats already paid",
      });
    }

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway unavailable",
      });
    }

    const totalAmount = member.claimedSeats.length * room.pricePerSeat;
    const transactionId = member.transactionId || buildTransactionId();
    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: transactionId,
      notes: {
        roomCode: room.roomCode,
        userId: req.user.id,
        seats: member.claimedSeats.join(","),
      },
    });

    await GroupRoom.updateOne(
      {
        roomCode: room.roomCode,
        "members.userId": req.user.id,
      },
      {
        $set: {
          "members.$.razorpayOrderId": order.id,
          "members.$.transactionId": transactionId,
        },
      }
    );

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      seats: member.claimedSeats,
      totalAmount,
      transactionId,
    });
  } catch (error) {
    console.error("createMemberOrder error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create group payment",
    });
  }
};

exports.verifyMemberPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
    } = req.body;

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

    const room = await GroupRoom.findOne({
      roomCode: req.params.roomCode?.toUpperCase(),
      expiresAt: { $gt: new Date() },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room expired or not found",
      });
    }

    const member = getCurrentUserMember(room, req.user.id);

    if (!member?.claimedSeats?.length) {
      return res.status(400).json({
        success: false,
        message: "No claimed seats found",
      });
    }

    if (member.paymentStatus === "paid" && member.bookingId) {
      return res.json({
        success: true,
        bookingId: member.bookingId,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const conflict = await Booking.findOne({
      show: room.showId,
      seats: { $in: member.claimedSeats },
      paymentStatus: "paid",
      bookingStatus: "confirmed",
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "One or more seats are already booked",
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      show: room.showId,
      seats: member.claimedSeats,
      totalPrice: member.claimedSeats.length * room.pricePerSeat,
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      transactionId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    member.paymentStatus = "paid";
    member.bookingId = booking._id;
    member.razorpayPaymentId = razorpay_payment_id;

    if (room.members.every((item) => item.paymentStatus === "paid")) {
      room.status = "completed";
    } else {
      room.status = "partial";
    }

    await room.save();

    await createNotification(
      room.leaderId,
      "GROUP_PAYMENT_RECEIVED",
      `${member.userName || "A friend"} paid for seats ${member.claimedSeats.join(", ")}.`,
      `/group/${room.roomCode}`
    );

    return res.json({
      success: true,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("verifyMemberPayment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify group payment",
    });
  }
};

exports.releaseExpiredRoom = async (req, res) => {
  try {
    const room = await GroupRoom.findOne({
      roomCode: req.params.roomCode?.toUpperCase(),
    });

    if (!room) {
      return res.json({
        success: true,
        message: "Already cleaned.",
      });
    }

    if (room.expiresAt > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Room has not expired yet.",
      });
    }

    if (room.seatLockId) {
      await SeatLock.findByIdAndDelete(room.seatLockId);
    }

    room.status = "expired";
    await room.save();

    await createNotification(
      room.leaderId,
      "GROUP_ROOM_EXPIRED",
      `Group room ${room.roomCode} expired.`,
      ""
    );

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error("releaseExpiredRoom error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to release group room",
    });
  }
};

exports.getAdminRooms = async (req, res) => {
  try {
    const rooms = await GroupRoom.find()
      .populate("leaderId", "name email")
      .populate({
        path: "showId",
        select: "startTime movie",
        populate: { path: "movie", select: "title" },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("getAdminRooms error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch group rooms",
    });
  }
};
