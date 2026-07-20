// ==========================================
// IMPORTS & MONGOOSE SETUP
// ==========================================
const mongoose = require('mongoose');

// ==========================================
// COMPLAINT SCHEMA DEFINITION
// ==========================================
const ComplaintSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    lawyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true 
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    evidence: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'closed', 'warned', 'suspended'],
        default: 'pending'
    },
    adminResponse: {
        type: String,
        default: ''
    },
    warningAccepted: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['client', 'lawyer'],
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// MODEL EXPORT
// ==========================================
module.exports = mongoose.model('Complaint', ComplaintSchema);