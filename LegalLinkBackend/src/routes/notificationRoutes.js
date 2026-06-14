const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead 
} = require('../controllers/notificationController');

// All notification routes are protected
router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
