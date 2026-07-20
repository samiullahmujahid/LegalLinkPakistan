// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
const Notification = require('../models/Notification');
const socketService = require('./socketService');

// ==========================================
// 1. NOTIFICATION PUSH & CREATION LOGIC
// ==========================================
/**
 * Create a notification in the database and push it in real-time if the user is online.
 * @param {string} recipientId - The Mongoose ID of the user receiving the notification
 * @param {string} title - The notification title
 * @param {string} body - The notification body content
 * @param {string} type - 'chat', 'booking', 'complaint', or 'admin_notice'
 * @param {object} data - Additional metadata for frontend navigation redirects (e.g. { bookingId, complaintId })
 */
const createAndSendNotification = async (recipientId, title, body, type, data = {}) => {
  try {
    if (!recipientId) return null;

    // 1. Save to DB
    const notification = new Notification({
      recipient: recipientId,
      title,
      body,
      type,
      data
    });
    await notification.save();

    // 2. Try sending in real-time via Socket.io
    const io = socketService.getIO();
    if (io) {
      const socketId = socketService.connectedUsers.get(recipientId.toString());
      if (socketId) {
        io.to(socketId).emit('newNotification', notification);
        console.log(`[Notification] Pushed real-time socket notification to user ${recipientId}`);
      } else {
        console.log(`[Notification] User ${recipientId} is offline. Saved to database.`);
      }
    }
    return notification;
  } catch (error) {
    console.error("[Notification Service] Error creating or sending notification:", error);
    return null;
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  createAndSendNotification
};
