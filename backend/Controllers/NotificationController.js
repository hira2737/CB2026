const Notification = require("../Models/Notification");

// ======================================================
// GET USER NOTIFICATIONS
// GET /api/notifications
// Returns latest 20 notifications + unread count
// ======================================================
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// ======================================================
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("markAllRead error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

// ======================================================
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// ======================================================
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead: true } }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("markOneRead error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};