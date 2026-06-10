const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: "All notifications marked as read" });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification || notification.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Notification not found");
  }
  await notification.deleteOne();
  res.json({ success: true, message: "Notification deleted" });
});

module.exports = { getNotifications, markAsRead, deleteNotification };
