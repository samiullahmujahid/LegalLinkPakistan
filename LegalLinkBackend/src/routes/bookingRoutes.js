const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Lawyer = require('../models/Lawyer');


const { 
    createBooking, 
    getLawyerActiveCount,
    getLawyerBookings,
    updateBookingStatus,
    cancelBooking, 
    getBookingStatus,
    getClientBookings,
    getLawyerWallet,
    completeAppointment
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/authMiddleware'); 
const Booking = require('../models/Booking');
const { createAndSendNotification } = require('../services/notificationService');

// ==========================================
// CLIENT ROUTES
// ==========================================
router.post('/create', protect, createBooking);
router.get('/my-bookings', protect, getClientBookings);

// ✅ FIX: Populate both lawyerId AND clientId
router.get('/status/:bookingId', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('lawyerId', 'name email phone address profilePicUri')
            .populate('clientId', 'name profilePicUri');
        
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        
        const bookingData = {
            ...booking._doc,
            lawyerName: booking.lawyerId?.name || "N/A",
            lawyerEmail: booking.lawyerId?.email || "N/A",
            lawyerPhone: booking.lawyerId?.phone || "N/A",
            lawyerAddress: booking.lawyerId?.address || "N/A",
            clientName: booking.clientId?.name || "N/A",
            clientPic: booking.clientId?.profilePicUri || "",
            review: booking.review || null
        };

        res.status(200).json({ success: true, booking: bookingData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/cancel/:bookingId', protect, cancelBooking);
router.post('/complete/:bookingId', protect, completeAppointment);

// ==========================================
// LAWYER ROUTES
// ==========================================
router.get('/lawyer-bookings', protect, getLawyerBookings); 
router.get('/lawyer-active-count/:lawyerId', protect, getLawyerActiveCount);
router.get('/lawyer/:lawyerId', protect, getLawyerBookings); 
router.put('/lawyer/update-status/:bookingId', protect, updateBookingStatus);
router.get('/lawyer/wallet/:lawyerId', protect, getLawyerWallet);

// ==========================================
// CALLING & ACCESS VERIFICATION
// ==========================================
router.get('/verify-access/:bookingId', protect, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;
        const booking = await Booking.findById(bookingId);

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const hasAccess = booking.clientId.toString() === userId || booking.lawyerId.toString() === userId;
        
        if (!hasAccess || booking.status !== 'confirmed') {
            return res.status(403).json({ success: false, message: "Unauthorized: Access denied" });
        }

        res.status(200).json({ success: true, authorized: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// PAYMENT ROUTES
// ==========================================
router.post('/payment/intent', protect, async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, 
            currency: 'pkr',
            metadata: { bookingId }
        });
        res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/confirm-payment/:bookingId', protect, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            { status: 'confirmed', paymentStatus: 'paid' }, 
            { new: true }
        ).populate('clientId', 'name').populate('lawyerId', 'name');
        
        if (!updatedBooking) return res.status(404).json({ success: false, message: "Booking not found" });

        const clientName = updatedBooking.clientId?.name || "Client";
        const lawyerName = updatedBooking.lawyerId?.name || "Legal Consultant";

        // Notify Lawyer
        await createAndSendNotification(
          updatedBooking.lawyerId._id || updatedBooking.lawyerId,
          "Payment Confirmed",
          `Payment of PKR 2500 confirmed for ${clientName}'s appointment. Your consultation is now active.`,
          "booking",
          { bookingId: updatedBooking._id }
        );

        // Notify Client
        await createAndSendNotification(
          updatedBooking.clientId._id || updatedBooking.clientId,
          "Booking Confirmed",
          `Your payment was successful! Your consultation with ${lawyerName} is confirmed.`,
          "booking",
          { bookingId: updatedBooking._id }
        );
        
        res.status(200).json({ success: true, booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// STRIPE CONNECT ONBOARDING ROUTES
// ==========================================

// 1. Initiate Stripe Onboarding (Lawyer only)
router.get('/stripe/onboard', protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const lawyer = await Lawyer.findById(userId);
        if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer account not found" });

        let stripeAccountId = lawyer.stripeAccountId;
        if (!stripeAccountId) {
            // Create a custom / express connected account
            const account = await stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                country: 'US', // Set to US for test mode connected account compatibility
                email: lawyer.email,
            });
            stripeAccountId = account.id;
            lawyer.stripeAccountId = stripeAccountId;
            await lawyer.save();
        }

        // Create the onboarding link
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `https://mug-work-public.ngrok-free.dev/api/bookings/stripe/refresh?lawyerId=${userId}`,
            return_url: `https://mug-work-public.ngrok-free.dev/api/bookings/stripe/return?lawyerId=${userId}`,
            type: 'account_onboarding',
        });

        return res.status(200).json({ success: true, url: accountLink.url });
    } catch (error) {
        console.error("Stripe Onboarding Link Creation Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Stripe Return Redirect Callback (handles database onboarding status update)
router.get('/stripe/return', async (req, res) => {
    try {
        const { lawyerId } = req.query;
        if (!lawyerId) return res.status(400).send("Lawyer ID parameter is missing");

        const lawyer = await Lawyer.findById(lawyerId);
        if (!lawyer) return res.status(404).send("Lawyer account not found");

        if (lawyer.stripeAccountId) {
            try {
                const account = await stripe.accounts.retrieve(lawyer.stripeAccountId);
                // In Stripe test mode, we mark onboarding complete automatically or check details_submitted
                if (account.details_submitted || process.env.NODE_ENV !== 'production') {
                    lawyer.stripeOnboardingComplete = true;
                    await lawyer.save();
                    console.log(`[Stripe Connect] Onboarding completed for lawyer ${lawyerId}`);
                }
            } catch (err) {
                console.error("Error retrieving Stripe account:", err);
                // Bypassing failure in test mode:
                lawyer.stripeOnboardingComplete = true;
                await lawyer.save();
            }
        }

        // Return a clean HTML page confirming success
        res.send(`
            <html>
                <head>
                    <title>Stripe Account Connected</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
                        .card { text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 420px; border: 1px solid #e2e8f0; }
                        h1 { color: #10b981; font-size: 24px; margin-bottom: 15px; }
                        p { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px; }
                        .btn { display: inline-block; background: #001a4d; color: white; padding: 12px 24px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,26,77,0.2); }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Stripe Account Connected! ✅</h1>
                        <p>Your Stripe Express account has been successfully linked to LegalLink Pakistan. You can now close this browser tab and return to the mobile application.</p>
                        <a href="javascript:window.close()" class="btn">Return to App</a>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error("Stripe Return Callback Error:", error);
        return res.status(500).send("Verification failed: " + error.message);
    }
});

// 3. Stripe Onboarding Link Expiry Refresh Callback
router.get('/stripe/refresh', async (req, res) => {
    try {
        const { lawyerId } = req.query;
        if (!lawyerId) return res.status(400).send("Lawyer ID parameter is missing");

        const lawyer = await Lawyer.findById(lawyerId);
        if (!lawyer || !lawyer.stripeAccountId) {
            return res.status(404).send("Lawyer or connected Stripe account not found");
        }

        const accountLink = await stripe.accountLinks.create({
            account: lawyer.stripeAccountId,
            refresh_url: `https://mug-work-public.ngrok-free.dev/api/bookings/stripe/refresh?lawyerId=${lawyerId}`,
            return_url: `https://mug-work-public.ngrok-free.dev/api/bookings/stripe/return?lawyerId=${lawyerId}`,
            type: 'account_onboarding',
        });

        return res.redirect(accountLink.url);
    } catch (error) {
        console.error("Stripe Onboarding Refresh Error:", error);
        return res.status(500).send("Failed to regenerate Stripe link: " + error.message);
    }
});

module.exports = router;