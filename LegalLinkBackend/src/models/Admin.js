// ==========================================
// IMPORTS & MONGOOSE SETUP
// ==========================================
const mongoose = require('mongoose');

// ==========================================
// ADMIN SCHEMA DEFINITION
// ==========================================
const AdminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, // Ensure unique email addresses for admin accounts
    lowercase: true, 
    trim: true 
  },
  adminKey: { 
    type: String, 
    required: true,
    trim: true 
  },
  otp: { 
    type: String, 
    default: "" 
  },
  otpExpires: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// ==========================================
// MODEL EXPORT
// ==========================================
module.exports = mongoose.model('Admin', AdminSchema, 'admins');