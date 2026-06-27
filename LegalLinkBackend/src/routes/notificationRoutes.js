const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  deleteMultipleNotifications
} = require('../controllers/notificationController');

// All notification routes are protected
router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/clear-all', protect, deleteAllNotifications);
router.post('/delete-multiple', protect, deleteMultipleNotifications);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
