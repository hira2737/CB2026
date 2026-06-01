const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../Middlewares/AuthMiddleware");

const {
  getNotifications,
  markAllRead,
  markOneRead,
} = require("../Controllers/NotificationController");

// IMPORTANT: /read-all must be registered BEFORE /:id/read
// to prevent Express matching "read-all" as a notification ID

router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllRead);
router.patch("/:id/read", authMiddleware, markOneRead);

module.exports = router;