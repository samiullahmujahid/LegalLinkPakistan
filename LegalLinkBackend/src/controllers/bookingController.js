// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
const Booking = require('../models/Booking');
const PaymentHistory = require('../models/PaymentHistory');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const { createAndSendNotification } = require('../services/notificationService');

// ==========================================
// 1. APPOINTMENT CREATION & COUNTERS
// ==========================================
// 1. Submit a new booking request from client side
const createBooking = async (req, res) => {
    try {
        const { lawyerId, courtLevel, caseType, subject, description } = req.body;
        const clientId = req.user._id;

        if (!lawyerId || !caseType || !description) {
            return res.status(400).json({
                success: false,
                message: "Required parameters missing (lawyerId, caseType, description)"
            });
        }

        const newBooking = new Booking({
            clientId: clientId,
            lawyerId: lawyerId,
            courtLevel: courtLevel || 'District Court',
            caseCategory: caseType,
            caseSubject: subject || 'Legal Consultation Request',
            caseDescription: description,
            status: 'pending'
        });

        await newBooking.save();

        // Send booking request notification to lawyer
        const ClientModel = require('../models/Client');
        const clientUser = await ClientModel.findById(clientId);
        const clientName = clientUser ? clientUser.name : "A Client";
        await createAndSendNotification(
            lawyerId,
            "New Appointment Request",
            `You have received a new consultation request from ${clientName}: "${subject || 'Legal Consultation Request'}"`,
            "booking",
            { bookingId: newBooking._id }
        );

        return res.status(201).json({
            success: true,
            message: "Booking request sent successfully",
            booking: newBooking
        });
    } catch (error) {
        console.error("Create Booking Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error saving appointment" });
    }
};

// 2. Get the live count of active/ongoing appointments
const getLawyerActiveCount = async (req, res) => {
    try {
        const lawyerId = req.params.lawyerId || req.user?._id;
        const activeCount = await Booking.countDocuments({
            lawyerId: lawyerId,
            status: { $in: ['accepted', 'awaiting_payment', 'confirmed', 'pending'] }
        });

        return res.status(200).json({
            success: true,
            activeAppointmentsCount: activeCount
        });
    } catch (error) {
        console.error("Get Active Count Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error fetching counter node" });
    }
};

// 3. Get all requests for a specific lawyer
const getLawyerBookings = async (req, res) => {
    try {
        const lawyerId = req.params.lawyerId || req.user?._id;

        const bookings = await Booking.find({ lawyerId: lawyerId })
            .populate({ path: 'clientId', select: 'name email profilePicUri' })
            .sort({ createdAt: -1 });

        const formattedBookings = await Promise.all(bookings.map(async (b) => {
            let clientData = b.clientId;
            if (!clientData || !clientData.name) {
                const rawBooking = await Booking.findById(b._id).select('clientId');
                const targetClientId = rawBooking?.clientId || (b.clientId?._id || b.clientId);
                if (targetClientId) {
                    const ClientModel = require('../models/Client');
                    let client = await ClientModel.findById(targetClientId).select('name email profilePicUri');
                    if (client) {
                        clientData = client;
                    } else {
                        const LawyerModel = require('../models/Lawyer');
                        const lawyerClient = await LawyerModel.findById(targetClientId).select('name email profilePicUri');
                        if (lawyerClient) {
                            clientData = lawyerClient;
                        }
                    }
                }
            }

            return {
                _id: b._id,
                status: b.status,
                caseCategory: b.caseCategory,
                caseSubject: b.caseSubject,
                caseDescription: b.caseDescription,
                courtLevel: b.courtLevel || 'District Court',
                scheduledDate: b.scheduledDate || '',
                scheduledTime: b.scheduledTime || '',
                name: clientData?.name || "Client",
                email: clientData?.email || "",
                avatarUri: clientData?.profilePicUri || "",
                createdAt: b.createdAt
            };
        }));

        return res.status(200).json({ success: true, bookings: formattedBookings });
    } catch (error) {
        console.error("Get Lawyer Bookings Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error fetching requests" });
    }
};

// 4. Accept or Reject a client's case booking request
const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, scheduledDate, scheduledTime } = req.body;

        if (!status) return res.status(400).json({ success: false, message: "Status payload missing" });

        const targetStatus = status.toLowerCase();
        
        if (targetStatus === 'completed') {
            return completeAppointment(req, res);
        }

        if (!['accepted', 'rejected'].includes(targetStatus)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        let updateFields = { status: targetStatus };
        if (targetStatus === 'accepted') {
            updateFields.scheduledDate = scheduledDate || new Date().toLocaleDateString();
            updateFields.scheduledTime = scheduledTime || '12:00 PM';
            
            // Calculate payment deadline
            const limitMinutes = parseInt(req.body.paymentLimitMinutes) || 30; // default to 30 minutes
            updateFields.paymentDeadline = new Date(Date.now() + limitMinutes * 60 * 1000);
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).populate('lawyerId', 'name');

        if (!updatedBooking) return res.status(404).json({ success: false, message: "Booking not found" });

        const lawyerName = updatedBooking.lawyerId?.name || "Legal Consultant";

        if (targetStatus === 'accepted') {
            await createAndSendNotification(
                updatedBooking.clientId,
                "Appointment Approved",
                `Your consultation request has been accepted by ${lawyerName} for ${updatedBooking.scheduledDate} at ${updatedBooking.scheduledTime}. Please complete the payment to confirm.`,
                "booking",
                { bookingId: updatedBooking._id }
            );
        } else if (targetStatus === 'rejected') {
            await createAndSendNotification(
                updatedBooking.clientId,
                "Appointment Request Declined",
                `Your consultation request has been rejected by ${lawyerName}.`,
                "booking",
                { bookingId: updatedBooking._id }
            );
        }

        return res.status(200).json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error("Update Booking Status Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error updating status" });
    }
};

// 5. Cancel Booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'rejected' },
            { new: true }
        ).populate('clientId', 'name').populate('lawyerId', 'name');

        if (!updatedBooking) return res.status(404).json({ success: false, message: "Booking not found" });

        const clientName = updatedBooking.clientId?.name || "A Client";

        // Since cancel is a client route, notify lawyer
        await createAndSendNotification(
            updatedBooking.lawyerId,
            "Booking Cancelled",
            `The appointment request has been cancelled by ${clientName}.`,
            "booking",
            { bookingId: updatedBooking._id }
        );

        return res.status(200).json({ success: true, booking: updatedBooking });
    } catch (error) {
        console.error("Cancel Booking Error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId || req.params.id)
            .populate({ path: 'lawyerId', select: 'name email phone address profilePicUri' })
            .populate({ path: 'clientId', select: 'name profilePicUri' });
        
        if (!booking) return res.status(404).json({ success: false, message: "Not found" });

        let resolvedClient = booking.clientId;
        if (!resolvedClient || !resolvedClient.name) {
            const rawBooking = await Booking.findById(req.params.bookingId || req.params.id);
            const targetClientId = rawBooking?.clientId || (booking.clientId?._id || booking.clientId);
            if (targetClientId) {
                const ClientModel = require('../models/Client');
                const clientDoc = await ClientModel.findById(targetClientId).select('name email phone address profilePicUri');
                if (clientDoc) {
                    resolvedClient = {
                        _id: clientDoc._id,
                        name: clientDoc.name,
                        email: clientDoc.email,
                        phone: clientDoc.phone,
                        address: clientDoc.address,
                        profilePicUri: clientDoc.profilePicUri
                    };
                } else {
                    const LawyerModel = require('../models/Lawyer');
                    const lawyerClient = await LawyerModel.findById(targetClientId).select('name email phone address profilePicUri');
                    if (lawyerClient) {
                        resolvedClient = {
                            _id: lawyerClient._id,
                            name: lawyerClient.name,
                            email: lawyerClient.email,
                            phone: lawyerClient.phone,
                            address: lawyerClient.address,
                            profilePicUri: lawyerClient.profilePicUri
                        };
                    }
                }
            }
        }

        return res.status(200).json({
            success: true,
            booking: {
                _id: booking._id,
                status: booking.status,
                caseCategory: booking.caseCategory,
                caseSubject: booking.caseSubject,
                courtLevel: booking.courtLevel,
                scheduledDate: booking.scheduledDate,
                scheduledTime: booking.scheduledTime,
                
                // Lawyer info
                lawyerId: booking.lawyerId?._id,
                lawyerName: booking.lawyerId?.name || "Legal Consultant",
                lawyerEmail: booking.lawyerId?.email || "N/A",
                lawyerPhone: booking.lawyerId?.phone || "N/A",
                lawyerAddress: booking.lawyerId?.address || "N/A",
                lawyerPic: booking.lawyerId?.profilePicUri || "",
                
                // Client info
                clientId: resolvedClient?._id || booking.clientId?._id,
                clientName: resolvedClient?.name || booking.clientId?.name || "Client",
                clientEmail: resolvedClient?.email || booking.clientId?.email || "N/A",
                clientPhone: resolvedClient?.phone || booking.clientId?.phone || "N/A",
                clientAddress: resolvedClient?.address || booking.clientId?.address || "N/A",
                clientPic: resolvedClient?.profilePicUri || booking.clientId?.profilePicUri || "",
                
                review: booking.review || null
            }
        });
    } catch (error) {
        console.error("Get Booking Status Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. CLIENT & LAWYER BOOKINGS STATUS
// ==========================================
// 7. Get ALL bookings for a SPECIFIC CLIENT
const getClientBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ clientId: req.user._id })
            .populate({ path: 'lawyerId', select: 'name profilePicUri' })
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            status: b.status,
            caseCategory: b.caseCategory,
            caseSubject: b.caseSubject,
            courtLevel: b.courtLevel || 'District Court',
            scheduledDate: b.scheduledDate || '',
            scheduledTime: b.scheduledTime || '',
            name: b.lawyerId?.name || "Legal Consultant",
            avatarUri: b.lawyerId?.profilePicUri || "",
            createdAt: b.createdAt
        }));

        return res.status(200).json({ success: true, bookings: formattedBookings });
    } catch (error) {
        console.error("Get Client Bookings Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 3. WALLET, PAYMENTS & APPOINTMENT COMPLETION
// ==========================================
// 8. Get Lawyer Wallet Data
const getLawyerWallet = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        let history = await PaymentHistory.find({ lawyerId }).populate('bookingId', 'caseSubject');
        
        // If history is empty, return some simulated transaction details for testing mode
        if (history.length === 0) {
            history = [
                {
                    _id: "mock_tx_1",
                    bookingId: { _id: "mock_b_1", caseSubject: "Child Custody Consultation" },
                    amount: 2500,
                    createdAt: new Date(Date.now() - 24 * 3600 * 1000) // 1 day ago
                },
                {
                    _id: "mock_tx_2",
                    bookingId: { _id: "mock_b_2", caseSubject: "Property Registration Review" },
                    amount: 3500,
                    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) // 3 days ago
                }
            ];
        }

        const totalEarnings = history.reduce((sum, item) => sum + item.amount, 0);
        
        // Fetch lawyer Stripe info
        const lawyer = await Lawyer.findById(lawyerId);
        // Automatically mock Stripe connection as completed for testing/demo
        const stripeOnboardingComplete = true;
        const stripeAccountId = lawyer ? (lawyer.stripeAccountId || "acct_test_mock_123") : "acct_test_mock_123";

        res.status(200).json({ 
            success: true, 
            history, 
            totalEarnings,
            stripeOnboardingComplete,
            stripeAccountId
        });
    } catch (error) {
        console.error("Wallet Fetch Error:", error);
        res.status(500).json({ success: false, message: "Error fetching wallet" });
    }
};

// 9. Confirm Payment and Save to Wallet/History
const confirmPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('clientId', 'name').populate('lawyerId', 'name');
        
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        await booking.save();

        await PaymentHistory.create({
            bookingId: booking._id,
            lawyerId: booking.lawyerId,
            clientId: booking.clientId,
            amount: 2500,
            paymentIntentId: 'stripe_payment_success'
        });

        const clientName = booking.clientId?.name || "Client";
        const lawyerName = booking.lawyerId?.name || "Legal Consultant";

        // Notify Lawyer
        await createAndSendNotification(
          booking.lawyerId._id || booking.lawyerId,
          "Payment Confirmed",
          `Payment of PKR 2500 confirmed for ${clientName}'s appointment. Your consultation is now active.`,
          "booking",
          { bookingId: booking._id }
        );

        // Notify Client
        await createAndSendNotification(
          booking.clientId._id || booking.clientId,
          "Booking Confirmed",
          `Your payment was successful! Your consultation with ${lawyerName} is confirmed.`,
          "booking",
          { bookingId: booking._id }
        );

        return res.status(200).json({ success: true, message: "Payment confirmed and recorded" });
    } catch (error) {
        console.error("Confirm Payment Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 10. Complete Appointment and Save Review
const completeAppointment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { rating, review } = req.body;

        if (!rating) return res.status(400).json({ success: false, message: "Rating is required to complete appointment" });

        const booking = await Booking.findById(bookingId).populate('clientId', 'name').populate('lawyerId', 'name');
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.status === 'completed') {
            return res.status(400).json({ success: false, message: "Appointment already completed" });
        }

        booking.status = 'completed';
        booking.review = {
            rating: parseInt(rating),
            comment: review || "",
            createdAt: new Date()
        };
        await booking.save();

        const clientName = booking.clientId?.name || "Client";
        const lawyerName = booking.lawyerId?.name || "Legal Consultant";

        // Notify Client
        await createAndSendNotification(
          booking.clientId._id || booking.clientId,
          "Appointment Completed",
          `Your consultation with ${lawyerName} is complete. Thank you for using Legal Link!`,
          "booking",
          { bookingId: booking._id }
        );

        // Notify Lawyer
        await createAndSendNotification(
          booking.lawyerId._id || booking.lawyerId,
          "Appointment Completed",
          `Your appointment with ${clientName} is marked complete. You received a rating of ${rating}/5.`,
          "booking",
          { bookingId: booking._id }
        );

        const lawyer = await Lawyer.findById(booking.lawyerId);
        if (lawyer) {
            const totalReviews = lawyer.totalReviews || 0;
            const currentRating = lawyer.averageRating || 0;
            const newAverageRating = ((currentRating * totalReviews) + parseInt(rating)) / (totalReviews + 1);
            
            lawyer.averageRating = parseFloat(newAverageRating.toFixed(1));
            lawyer.totalReviews = totalReviews + 1;
            await lawyer.save();
        }

        return res.status(200).json({ 
            success: true, 
            message: "Appointment completed and review submitted successfully",
            booking: booking
        });
    } catch (error) {
        console.error("Complete Appointment Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error completing appointment" });
    }
};

const createPaymentIntent = async (req, res) => {
    return res.status(200).json({ success: true, clientSecret: "pi_mock_786", message: "Intent created" });
};

// Updated Complaint Submission Helper
const submitComplaint = async (req, res) => {
    // Note: Complaint logic is mainly in complaintController.js
    // This is a placeholder for specific booking-related complaints
    return res.status(200).json({ success: true, message: "Complaint logged for review" });
};

const deleteBooking = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isAuthorized = 
            booking.clientId.toString() === userId.toString() ||
            booking.lawyerId.toString() === userId.toString();

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this booking" });
        }

        const deletableStatuses = ['completed', 'rejected'];
        if (!deletableStatuses.includes(booking.status.toLowerCase())) {
            return res.status(400).json({ success: false, message: "Only completed or rejected appointments can be deleted" });
        }

        await Booking.findByIdAndDelete(req.params.bookingId);
        return res.status(200).json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Delete Booking Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error deleting booking" });
    }
};

const createInstantChatBooking = async (req, res) => {
    try {
        const myId = req.user._id || req.user.id;
        const { targetLawyerId } = req.body;

        if (!targetLawyerId) {
            return res.status(400).json({ success: false, message: "Target lawyer ID required" });
        }

        // Check if there is already a confirmed booking between these two users
        let booking = await Booking.findOne({
            $or: [
                { clientId: myId, lawyerId: targetLawyerId },
                { clientId: targetLawyerId, lawyerId: myId }
            ],
            status: 'confirmed'
        });

        if (!booking) {
            booking = new Booking({
                clientId: myId,
                lawyerId: targetLawyerId,
                courtLevel: 'District Court',
                caseCategory: 'Professional Consultation',
                caseDescription: 'Direct chat channel between legal professionals.',
                status: 'confirmed',
                paymentStatus: 'paid'
            });
            await booking.save();
        }

        return res.status(200).json({ success: true, booking });
    } catch (error) {
        console.error("Create Instant Chat Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error establishing chat connection" });
    }
};

// 15. Fetch all reviews for a given lawyer
const getLawyerReviews = async (req, res) => {
    try {
        const { lawyerId } = req.params;
        const bookings = await Booking.find({ 
            lawyerId: lawyerId, 
            "review.rating": { $exists: true, $ne: null } 
        })
        .populate('clientId', 'name profilePicUri')
        .sort({ "review.createdAt": -1 });

        const reviews = await Promise.all(bookings.map(async (b) => {
            let clientData = b.clientId;
            if (!clientData || !clientData.name) {
                const ClientModel = require('../models/Client');
                const clientDoc = await ClientModel.findById(b.clientId).select('name profilePicUri');
                if (clientDoc) {
                    clientData = clientDoc;
                }
            }
            
            return {
                bookingId: b._id,
                rating: b.review.rating,
                comment: b.review.comment,
                createdAt: b.review.createdAt || b.updatedAt || new Date(),
                clientName: clientData?.name || "M. Ali",
                clientPic: clientData?.profilePicUri || ""
            };
        }));

        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("Get Lawyer Reviews Error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// MODULE EXPORTS
// ==========================================
module.exports = {
    createBooking,
    getLawyerActiveCount,
    getLawyerBookings,
    updateBookingStatus,
    cancelBooking,
    getBookingStatus,
    getClientBookings,
    getLawyerWallet,
    createPaymentIntent,
    confirmPayment,
    submitComplaint,
    completeAppointment,
    deleteBooking,
    createInstantChatBooking,
    getLawyerReviews
};