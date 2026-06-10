const Notification = require("../models/Notification");

/**
 * Create a notification record for a user.
 * @param {string} userId   - Recipient user ObjectId
 * @param {string} message  - Notification message
 */
const sendNotification = async (userId, message) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (err) {
    // Notification failures should not crash the main request
    console.error("Notification error:", err.message);
  }
};

module.exports = sendNotification;
