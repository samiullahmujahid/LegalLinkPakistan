const Notification = require('../models/Notification');

// 1. Get current user's notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Server Error fetching notifications" });
  }
};

// 2. Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({ success: false, message: "Server Error updating notification" });
  }
};

// 3. Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({ success: false, message: "Server Error updating notifications" });
  }
};

// 4. Delete single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    console.log(`[Backend] deleteNotification called for ID: ${id}, user ID: ${userId}`);

    const notification = await Notification.findOneAndDelete({ _id: id, recipient: userId });
    console.log(`[Backend] deleteNotification result:`, notification);

    if (!notification) {
      console.log(`[Backend] deleteNotification notification not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return res.status(500).json({ success: false, message: "Server Error deleting notification" });
  }
};

// 5. Delete all notifications
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    console.log(`[Backend] deleteAllNotifications called for user ID: ${userId}`);

    const result = await Notification.deleteMany({ recipient: userId });
    console.log(`[Backend] deleteAllNotifications result:`, result);

    return res.status(200).json({ success: true, message: "All notifications deleted successfully" });
  } catch (error) {
    console.error("Delete All Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Server Error deleting notifications" });
  }
};

// 6. Delete multiple notifications
exports.deleteMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user._id || req.user.id;
    console.log(`[Backend] deleteMultipleNotifications called for IDs:`, ids, `user ID: ${userId}`);

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: "Invalid or missing notification IDs" });
    }

    const result = await Notification.deleteMany({ _id: { $in: ids }, recipient: userId });
    console.log(`[Backend] deleteMultipleNotifications result:`, result);

    return res.status(200).json({ success: true, message: "Selected notifications deleted successfully" });
  } catch (error) {
    console.error("Delete Multiple Notifications Error:", error);
    return res.status(500).json({ success: false, message: "Server Error deleting notifications" });
  }
};
