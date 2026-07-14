const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
    // --- Personal Information ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    
    // --- Professional Credentials ---
    barCouncil: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    courtLevel: { type: String, default: "Lower Court" }, 
    specialization: { type: String, default: "" },
    experience: { type: String, default: "0" },
    
    // Verification Fields
    licensePicUri: { type: String, default: "" }, 
    licenseExpiry: { type: String, default: "" }, 
    enrollmentNumber: { type: String, default: "" }, 
    enNo: { type: String, default: "" }, 
    city: { type: String, default: "" },            
    district: { type: String, default: "" },            
    province: { type: String, default: "" },            
    cnic: { type: String, default: "" },

    // --- Expertise & Office Details ---
    areasOfPractice: { type: [String], default: [] },  
    bio: { type: String, default: "" },            
    officeAddress: { type: String, default: "" },    
    profilePic: { type: String, default: "" },    
    profilePicUri: { type: String, default: "" },
    
    // --- Rating System ---
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // --- Payment Details ---
    easyPaisa: { type: String, default: "" },
    jazzCash: { type: String, default: "" },
    consultationFee: { type: String, default: "1000" },  
    paymentMethod: { type: String, default: 'Local/Stripe' },
    stripeAccountId: { type: String, default: "" },
    stripeOnboardingComplete: { type: Boolean, default: false },

    // --- System Roles & Permissions ---
    role: { type: String, default: 'Lawyer' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isApproved: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false }, 
    suspendedUntil: { type: Date, default: null },
    suspensionReason: { type: String, default: "" },
    
    rejectionReason: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'lawyers' }); 

const Lawyer = mongoose.model('Lawyer', lawyerSchema);
module.exports = Lawyer;