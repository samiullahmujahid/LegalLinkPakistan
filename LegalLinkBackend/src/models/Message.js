const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true }, // User ID
    text: { type: String, required: true },
    type: { type: String, default: 'text' }, 
    fileName: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
