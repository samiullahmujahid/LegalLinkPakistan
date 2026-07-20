// ==========================================
// IMPORTS & MONGOOSE SETUP
// ==========================================
const mongoose = require('mongoose');

// ==========================================
// PAYMENT HISTORY SCHEMA DEFINITION
// ==========================================
const PaymentHistorySchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    status: { type: String, default: 'succeeded' },
    createdAt: { type: Date, default: Date.now }
});

// ==========================================
// MODEL EXPORT
// ==========================================
module.exports = mongoose.model('PaymentHistory', PaymentHistorySchema);