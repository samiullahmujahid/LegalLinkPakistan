// ==========================================
// IMPORTS & MONGOOSE SETUP
// ==========================================
const mongoose = require('mongoose');

// ==========================================
// USER SCHEMA DEFINITION
// ==========================================
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Client', 'Lawyer', 'Admin'],
    default: 'Client'
  },
  profilePic: {
    type: String,
    default: ''
  },
  address: {
    city: String,
    district: String,
    province: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ==========================================
// MODEL EXPORT
// ==========================================
module.exports = mongoose.model('User', UserSchema);