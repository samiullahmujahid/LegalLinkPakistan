const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    profilePic: { type: String, default: '' }, 
    profilePicUri: { type: String, default: '' },
    address: {
        city: String,
        district: String,
        province: String
    },
    password: { type: String, required: true },
    role: { type: String, default: 'Client' },
    isSuspended: { type: Boolean, default: false }, 
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, default: "" },
    
    createdAt: { type: Date, default: Date.now }
}, { collection: 'clients' }); 

module.exports = mongoose.model('Client', ClientSchema);