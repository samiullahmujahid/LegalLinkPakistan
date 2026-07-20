// ==========================================
// IMPORTS & MONGOOSE SETUP
// ==========================================
const mongoose = require('mongoose');

// ==========================================
// MESSAGE SCHEMA DEFINITION
// ==========================================
const messageSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    type: { type: String, default: 'text' }, 
    fileName: { type: String },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

// ==========================================
// MODEL EXPORT
// ==========================================
module.exports = mongoose.model('Message', messageSchema);
