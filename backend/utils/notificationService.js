const Notification = require("../Models/Notification");

const createNotification = async (
  userId,
  type,
  message,
  link = ""
) => {
  try {
    if (!userId || !type || !message) return null;

    return await Notification.create({
      user: userId,
      type,
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
