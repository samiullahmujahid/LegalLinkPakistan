const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware'); 

// Debug checking logs
console.log("-------------------------------------------");
console.log("🛠️ Loading Admin Route Handlers:");
console.log("Admin Login Function:", typeof adminController.adminLogin);
console.log("Verify OTP Function:", typeof adminController.verifyOtp);
console.log("getStats Function:", typeof adminController.getStats);
console.log("getPendingLawyers Function:", typeof adminController.getPendingLawyers);
console.log("updateLawyerStatus Function:", typeof adminController.updateLawyerStatus);
console.log("-------------------------------------------");

// --- Admin Auth Routes (Public) ---
router.post('/login', adminController.adminLogin);
router.post('/verify-otp', adminController.verifyOtp);

// --- Admin Management Routes (Protected) ---
router.get('/stats', protect, adminController.getStats);
router.get('/pending-lawyers', protect, adminController.getPendingLawyers);
router.post('/update-status', protect, adminController.updateLawyerStatus);

module.exports = router;