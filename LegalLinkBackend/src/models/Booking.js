const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
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
    courtLevel: {
        type: String,
        enum: ['Supreme Court', 'High Court', 'District Court'],
        default: 'District Court'
    },
    caseCategory: {
        type: String,
        required: true,
        trim: true
    },
    caseSubject: {
        type: String,
        trim: true,
        default: 'Legal Consultation Request'
    },
    caseDescription: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'awaiting_payment', 'confirmed', 'rejected', 'completed'],
        default: 'pending' 
    },
    scheduledDate: {
        type: String, 
        default: null
    },
    scheduledTime: {
        type: String, 
        default: null
    },
    stripePaymentIntentId: {
        type: String,
        default: null
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'
    },
    // Unified review object to store rating and comment
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date }
    },
    paymentDeadline: {
        type: Date,
        default: null
    },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true 
});

module.exports = mongoose.model('Booking', BookingSchema);