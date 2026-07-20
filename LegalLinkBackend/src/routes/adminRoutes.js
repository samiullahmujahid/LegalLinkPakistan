// ==========================================
// IMPORTS & SETUP
// ==========================================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware'); 

// ==========================================
// 1. PUBLIC ADMIN AUTH ROUTES
// ==========================================
router.post('/login', adminController.adminLogin);
router.post('/verify-otp', adminController.verifyOtp);
router.post('/resend-otp', adminController.resendOtp);

// ==========================================
// 2. PROTECTED ADMIN MANAGEMENT ROUTES
// ==========================================
router.get('/stats', protect, adminController.getStats);
router.get('/pending-lawyers', protect, adminController.getPendingLawyers);
router.post('/update-status', protect, adminController.updateLawyerStatus);

// ==========================================
// EXPORTS
// ==========================================
module.exports = router;