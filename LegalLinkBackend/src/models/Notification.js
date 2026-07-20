// ==========================================
// IMPORTS & MONGOOSE SETUP
// ==========================================
const mongoose = require('mongoose');

// ==========================================
// NOTIFICATION SCHEMA DEFINITION
// ==========================================
const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['chat', 'booking', 'complaint', 'admin_notice'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ==========================================
// MODEL EXPORT
// ==========================================
module.exports = mongoose.model('Notification', NotificationSchema);
