// ==========================================
// IMPORTS & TRANSPORTER SETUP
// ==========================================
const Admin = require('../models/Admin');
const Lawyer = require('../models/Lawyer');
const Client = require('../models/Client');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'samiullahmujahid.pk@gmail.com', 
        pass: 'xgfmysszwdqnkbkx'            
    }
});

// ==========================================
// 1. ADMIN AUTHENTICATION (LOGIN & OTP)
// ==========================================
const adminLogin = async (req, res) => {
    try {
        const { email, adminKey } = req.body;
        
        console.log("Login attempt for:", email);

        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log("Admin not found in DB");
            return res.status(401).json({ success: false, message: "Invalid Email" });
        }

        if (admin.adminKey !== adminKey) {
            console.log("Admin key mismatch");
            return res.status(401).json({ success: false, message: "Invalid Admin Key" });
        }

        // OTP Generate (6 Digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        admin.otp = otp;
        admin.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await admin.save();

        // Send Email
        await transporter.sendMail({
            from: '"LegalLink Admin" <samiullahmujahid.pk@gmail.com>',
            to: email,
            subject: 'Admin Login OTP',
            text: `Your 6-digit OTP for LegalLink Admin login is: ${otp}`
        });

        console.log(`✅ OTP sent to ${email}: ${otp}`);
        res.status(200).json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        console.error("Login Controller Error:", error);
        res.status(500).json({ success: false, message: "Error: " + error.message });
    }
};

// ==========================================
// 2. VERIFY & RESEND OTP
// ==========================================
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin || !admin.otp) {
            return res.status(404).json({ success: false, message: "Admin or OTP not found" });
        }

        if (admin.otp !== otp) {
            return res.status(401).json({ success: false, message: "Invalid OTP" });
        }

        if (Date.now() > admin.otpExpires) {
            return res.status(401).json({ success: false, message: "OTP has expired" });
        }

        // Token creation with Admin role
        const token = jwt.sign(
            { id: admin._id, role: 'Admin' }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '24h' }
        );

        // Clear OTP after successful verification
        admin.otp = ""; 
        admin.otpExpires = null;
        await admin.save();

        res.status(200).json({ success: true, token, message: "Login successful!" });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        res.status(500).json({ success: false, message: "Server error during verification" });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log("Resend OTP attempt for admin:", email);

        const admin = await Admin.findOne({ email });

        if (!admin) {
            console.log("Admin not found in DB");
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        // OTP Generate (6 Digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        admin.otp = otp;
        admin.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await admin.save();

        // Send Email
        await transporter.sendMail({
            from: '"LegalLink Admin" <samiullahmujahid.pk@gmail.com>',
            to: email,
            subject: 'Admin Login OTP',
            text: `Your new 6-digit OTP for LegalLink Admin login is: ${otp}`
        });

        console.log(`✅ OTP resent to ${email}: ${otp}`);
        res.status(200).json({ success: true, message: "OTP resent to your email" });
    } catch (error) {
        console.error("Resend OTP Controller Error:", error);
        res.status(500).json({ success: false, message: "Error: " + error.message });
    }
};

// ==========================================
// 3. DASHBOARD STATS & LAWYER VERIFICATION
// ==========================================
const getStats = async (req, res) => {
    try {
        const totalLawyers = await Lawyer.countDocuments({ status: 'approved' });
        const totalClients = await Client.countDocuments();
        res.status(200).json({ success: true, totalLawyers, totalClients });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

const getPendingLawyers = async (req, res) => {
    try {
        const lawyers = await Lawyer.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, lawyers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching pending lawyers" });
    }
};

const updateLawyerStatus = async (req, res) => {
    try {
        const { id, status, reason } = req.body;
        const updateData = { 
            status, 
            isApproved: status === 'approved', 
            rejectionReason: status === 'approved' ? "" : reason 
        };
        const lawyer = await Lawyer.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });
        
        res.status(200).json({ success: true, data: lawyer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating lawyer status" });
    }
};

// ==========================================
// MODULE EXPORTS
// ==========================================
module.exports = { adminLogin, verifyOtp, resendOtp, getStats, getPendingLawyers, updateLawyerStatus };