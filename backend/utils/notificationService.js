const Notification = require("../Models/Notification");

const createNotification = async (
  userId,
  type,
  message,
  link = ""
) => {
  try {
    if (!userId || !type || !message) return null;

    const allowedTypes = new Set(["login", "booking", "payment", "system"]);
    const normalizedType = allowedTypes.has(type) ? type : "system";

    return await Notification.create({
      user: userId,
      type: normalizedType,
      message,
      link,
    });
  } catch (error) {
    console.error("createNotification failed:", error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
