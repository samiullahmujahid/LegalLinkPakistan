const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Client = require('../models/Client');
const Lawyer = require('../models/Lawyer');
const Admin = require('../models/Admin');
const { protect } = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

const multer = require('multer');
const fs = require('fs');

// Ensure uploads/profile directory exists
if (!fs.existsSync('uploads/profile')) {
  fs.mkdirSync('uploads/profile', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
const uploadFields = upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'licensePic', maxCount: 1 }
]);

// ==========================================
// CONTROLLER-BASED ROUTES
// ==========================================
router.post('/register', uploadFields, authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verify-otp', authController.verifyAdminOTP);
router.get('/lawyers', authController.getAllLawyers);
router.put('/profile/update', protect, authController.updateProfile);
router.put('/profile/update-password', protect, authController.updatePassword);
router.get('/lawyers/recommended', protect, authController.getRecommendedLawyers);

// ==========================================
// DIRECT ROUTE HANDLERS (Merged from old auth.js)
// ==========================================

// Admin Login
router.post('/admin-login', async (req, res) => {
    try {
        const { email, adminKey } = req.body;
        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (!admin || admin.adminKey !== adminKey) return res.status(401).json({ message: "Invalid Admin Credentials!" });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        admin.otp = otp;
        admin.otpExpires = Date.now() + 600000;
        await admin.save();
        res.status(200).json({ message: "OTP Generated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// Client Registration
router.post('/register-client', async (req, res) => {
    try {
        const { name, email, phone, city, district, province, password } = req.body;
        const cleanEmail = email.trim().toLowerCase();
        if (await Client.findOne({ email: cleanEmail })) return res.status(400).json({ message: "Email already registered" });
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        await new Client({ name, email: cleanEmail, phone, address: { city, district, province }, password: hashedPassword, role: 'Client' }).save();
        res.status(201).json({ message: "Client registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
});

// Lawyer Registration
router.post('/register-lawyer', async (req, res) => {
    try {
        const { name, email, phone, city, district, province, password, barCouncil, enrollmentNumber, courtLevel, licenseNumber, licenseExpiry, areasOfPractice, bio, officeAddress } = req.body;
        const cleanEmail = email.trim().toLowerCase();
        if (await Lawyer.findOne({ email: cleanEmail })) return res.status(400).json({ message: "Lawyer already registered" });
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        await new Lawyer({ name, email: cleanEmail, phone, address: { city, district, province }, password: hashedPassword, barCouncil, enrollmentNumber, courtLevel, licenseNumber, licenseExpiry, areasOfPractice, bio, officeAddress, role: 'Lawyer', isApproved: false }).save();
        res.status(201).json({ message: "Lawyer registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
});

// Fetch Specific Lawyer Profile
router.get('/lawyer-profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const lawyer = await Lawyer.findById(req.params.id).select('-password');
        if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });
        res.status(200).json(lawyer);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// NEW: Fetch Generic Profile (Lawyer or Client)
router.get('/profile/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const lawyer = await Lawyer.findById(req.params.id).select('-password');
        if (lawyer) return res.status(200).json(lawyer);
        
        const client = await Client.findById(req.params.id).select('-password');
        if (client) return res.status(200).json(client);
        
        res.status(404).json({ message: "User not found" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;