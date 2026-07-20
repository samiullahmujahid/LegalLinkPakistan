const Client = require('../models/Client');
const Lawyer = require('../models/Lawyer');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const nodemailer = require('nodemailer');
const mongoose = require('mongoose'); // Added for ID validation
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const FIXED_ADMIN_EMAIL = "samiullahmujahid.pk@gmail.com";
const FIXED_ADMIN_KEY = "LLP123"; 

let tempAdminOTP = {
    otp: "",
    expires: null
};

const generateToken = (id, role) => {
    return jwt.sign(
        { id, role }, 
        process.env.JWT_SECRET || 'YOUR_SECRET_KEY', 
        { expiresIn: '30d' }
    );
};

const saveBase64Image = (base64Str, prefix) => {
    if (!base64Str || !base64Str.startsWith('data:')) return "";
    try {
        const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return "";
        const ext = matches[1].split('/')[1] || 'jpg';
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${prefix}-${Date.now()}.${ext}`;
        const relativePath = `uploads/profile/${filename}`;
        
        const path = require('path');
        const fs = require('fs');
        const absolutePath = path.join(__dirname, '../../', relativePath);
        
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(absolutePath, buffer);
        return relativePath;
    } catch (err) {
        console.error("Base64 Save Error:", err);
        return "";
    }
};

// ==========================================
// 1. USER REGISTRATION (WITH DYNAMIC MULTIPART FILE CAPTURE)
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const searchEmail = email ? email.toLowerCase().trim() : "";

        console.log(`📥 Incoming Signup Request for Role: [${role}] - Email: [${searchEmail}]`);

        if (!searchEmail || !password || !role) {
            return res.status(400).json({ success: false, message: "Email, Password and Role are required fields!" });
        }

        if (searchEmail === FIXED_ADMIN_EMAIL) {
            return res.status(400).json({ success: false, message: "This email is reserved for Admin!" });
        }

        const exists = await Promise.all([
            Client.findOne({ email: searchEmail }),
            Lawyer.findOne({ email: searchEmail })
        ]);

        if (exists.some(user => user !== null)) {
            console.log(`⚠️ Email check failed. [${searchEmail}] already exists inside DB.`);
            return res.status(400).json({ success: false, message: "Email is already registered!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let newUser;
        if (role === 'Lawyer') {
            const enrollmentNumber = req.body.enrollmentNumber || req.body.enNo || "";
            const enNo = req.body.enNo || req.body.enrollmentNumber || "";

            const lawyerData = {
                ...req.body,
                name: req.body.name || "Legal Link Lawyer",
                phone: req.body.phone || req.body.phoneNumber || "03000000000",
                email: searchEmail,
                password: hashedPassword,
                enrollmentNumber: enrollmentNumber,
                enNo: enNo,
                status: 'pending',
                isApproved: false,
                profilePicUri: "",
                licensePicUri: "",
                licenseExpiry: req.body.licenseExpiry || "",
                courtLevel: req.body.profCourtLevel || req.body.courtLevel || "",
                experience: req.body.experience || "0"
            };

            if (req.body.areasOfPractice) {
                try {
                    lawyerData.areasOfPractice = typeof req.body.areasOfPractice === 'string'
                        ? JSON.parse(req.body.areasOfPractice)
                        : req.body.areasOfPractice;
                } catch (e) {
                    console.log("Error parsing areasOfPractice:", e);
                    lawyerData.areasOfPractice = [req.body.areasOfPractice];
                }
            }

            if (req.body.profilePicBase64) {
                const filePath = saveBase64Image(req.body.profilePicBase64, 'profile');
                if (filePath) {
                    lawyerData.profilePic = filePath;
                    lawyerData.profilePicUri = filePath;
                }
            }
            if (req.body.licensePicBase64) {
                const filePath = saveBase64Image(req.body.licensePicBase64, 'license');
                if (filePath) {
                    lawyerData.licensePicUri = filePath;
                }
            }

            if (req.files) {
                if (req.files['profilePic'] && req.files['profilePic'][0]) {
                    const filePath = req.files['profilePic'][0].path.replace(/\\/g, '/');
                    lawyerData.profilePic = filePath;
                    lawyerData.profilePicUri = filePath;
                }
                if (req.files['licensePic'] && req.files['licensePic'][0]) {
                    lawyerData.licensePicUri = req.files['licensePic'][0].path.replace(/\\/g, '/');
                }
            } else if (req.file) {
                const filePath = req.file.path.replace(/\\/g, '/');
                lawyerData.profilePic = filePath;
                lawyerData.profilePicUri = filePath;
            }

            if (!lawyerData.profilePicUri && req.body.profilePicUri) {
                if (!req.body.profilePicUri.includes('file:///')) {
                    lawyerData.profilePicUri = req.body.profilePicUri;
                }
            }
            if (!lawyerData.licensePicUri && req.body.licensePicUri) {
                if (!req.body.licensePicUri.includes('file:///')) {
                    lawyerData.licensePicUri = req.body.licensePicUri;
                }
            }

            if (!lawyerData.cnic) delete lawyerData.cnic;
            if (!lawyerData.licenseNumber) delete lawyerData.licenseNumber;
            if (!lawyerData.enrollmentNumber) delete lawyerData.enrollmentNumber;
            if (!lawyerData.enNo) delete lawyerData.enNo;

            newUser = new Lawyer(lawyerData);
        } else if (role === 'Client') {
            const { name, phone, phoneNumber, city, district, province } = req.body;
            
            newUser = new Client({
                name: name || "Legal Link Client", 
                email: searchEmail,
                password: hashedPassword,
                phone: phone || phoneNumber || "03000000000",
                address: { 
                    city: city || "", 
                    district: district || "", 
                    province: province || "" 
                },
                role: 'Client'
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid role specified!" });
        }

        await newUser.save();
        console.log(`✅ ${role} Registered Safely in Database: ${searchEmail}`);
        return res.status(201).json({ success: true, message: "Registration successful!" });

    } catch (err) {
        console.log("\n💥 ====== DATABASE REJECTION LOG START ======");
        console.error("Error Code:", err.code); 
        console.error("Error Message:", err.message);
        console.log("💥 ============================================\n");

        return res.status(500).json({ 
            success: false, 
            message: "Registration failed on database write layer.", 
            error: err.message 
        });
    }
};

// ==========================================
// 2. USER LOGIN SYSTEM
// ==========================================
exports.loginUser = async (req, res) => {
    try {
        const { email, password, role, adminKey } = req.body;
        const searchEmail = email ? email.toLowerCase().trim() : "";

        console.log(`🔑 Login Attempt: ${role} | Email: ${searchEmail}`);

        if (role === 'Admin') {
            if (!searchEmail) {
                return res.status(400).json({ success: false, message: "Email is required!" });
            }

            const incomingKey = adminKey || password;
            if (!incomingKey || incomingKey.trim() !== FIXED_ADMIN_KEY) {
                return res.status(401).json({ success: false, message: "Invalid Admin Key or Password!" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            tempAdminOTP.otp = otp;
            tempAdminOTP.expires = Date.now() + 10 * 60 * 1000;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'samiullahmujahid.pk@gmail.com',
                    pass: 'lgknfmwxmbcsftnj'
                }
            });

            const mailOptions = {
                from: '"Legal Link Pakistan" <samiullahmujahid.pk@gmail.com>',
                to: "samiullahmujahid.pk@gmail.com",
                subject: 'Admin Portal Login OTP',
                text: `Your OTP for Legal Link Pakistan Admin Portal is: ${otp}. It expires in 10 minutes.`
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ 
                success: true, 
                message: "OTP sent to your email",
                email: "samiullahmujahid.pk@gmail.com"
            });
        }

        if (role === 'Lawyer') {
            const lawyer = await Lawyer.findOne({ email: searchEmail });
            if (!lawyer) return res.status(404).json({ success: false, message: "Lawyer account not found" });

            const isMatch = await bcrypt.compare(password, lawyer.password);
            if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Password!" });

            // --- Suspension Check ---
            if (lawyer.isSuspended) {
                if (lawyer.suspendedUntil && new Date(lawyer.suspendedUntil) < new Date()) {
                    // Auto lift
                    lawyer.isSuspended = false;
                    lawyer.suspendedUntil = null;
                    lawyer.suspensionReason = "";
                    await Lawyer.findByIdAndUpdate(lawyer._id, { isSuspended: false, suspendedUntil: null, suspensionReason: "" });
                } else {
                    const expiryMsg = lawyer.suspendedUntil 
                        ? `until ${new Date(lawyer.suspendedUntil).toLocaleDateString()}` 
                        : "permanently";
                    return res.status(403).json({ 
                        success: false, 
                        isSuspended: true, 
                        message: `Your account has been suspended ${expiryMsg}. Reason: ${lawyer.suspensionReason || "Admin decision"}` 
                    });
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: "Login Successful", 
                token: generateToken(lawyer._id, 'Lawyer'), 
                user: {
                    id: lawyer._id,
                    name: lawyer.name,
                    email: lawyer.email,
                    role: 'Lawyer',
                    status: lawyer.status,
                    isApproved: lawyer.isApproved
                } 
            });
        }

        if (role === 'Client') {
            const client = await Client.findOne({ email: searchEmail });
            if (!client) return res.status(404).json({ success: false, message: "Client account not found" });

            const isMatch = await bcrypt.compare(password, client.password);
            if (!isMatch) return res.status(401).json({ success: false, message: "Invalid Password!" });

            // --- Suspension Check ---
            if (client.isSuspended) {
                if (client.suspendedUntil && new Date(client.suspendedUntil) < new Date()) {
                    // Auto lift
                    client.isSuspended = false;
                    client.suspendedUntil = null;
                    client.suspensionReason = "";
                    await Client.findByIdAndUpdate(client._id, { isSuspended: false, suspendedUntil: null, suspensionReason: "" });
                } else {
                    const expiryMsg = client.suspendedUntil 
                        ? `until ${new Date(client.suspendedUntil).toLocaleDateString()}` 
                        : "permanently";
                    return res.status(403).json({ 
                        success: false, 
                        isSuspended: true, 
                        message: `Your account has been suspended ${expiryMsg}. Reason: ${client.suspensionReason || "Admin decision"}` 
                    });
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: "Login Successful", 
                token: generateToken(client._id, 'Client'), 
                user: {
                    id: client._id,
                    name: client.name,
                    email: client.email,
                    role: 'Client'
                } 
            });
        }

    } catch (err) {
        console.error("Login Error:", err.message);
        return res.status(500).json({ success: false, message: "Server error during login" });
    }
};

// ==========================================
// 3. ADMIN OTP VERIFICATION LAYER
// ==========================================
exports.verifyAdminOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const searchEmail = email ? email.toLowerCase().trim() : "";

        if (searchEmail !== FIXED_ADMIN_EMAIL) {
            return res.status(404).json({ success: false, message: "Admin not found!" });
        }

        if (tempAdminOTP.otp === otp && tempAdminOTP.expires > Date.now()) {
            tempAdminOTP.otp = ""; 
            tempAdminOTP.expires = null;

            return res.status(200).json({ 
                success: true, 
                message: "Access Granted.",
                token: generateToken('ADMIN_NODE_ID', 'Admin'), 
                user: { email: FIXED_ADMIN_EMAIL, role: 'Admin' }
            });
        } else {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }
    } catch (err) {
        console.error("OTP Error:", err.message);
        return res.status(500).json({ success: false, message: "Verification failed." });
    }
};

// ==========================================
// 4. GET ALL LAWYERS DATA STREAM
// ==========================================
exports.getAllLawyers = async (req, res) => {
    try {
        console.log("⚡ Database Trigger: Executing query to pull lawyers cluster data...");
        const lawyers = await Lawyer.find({}).select('-password').lean();
        
        const sanitizedLawyers = lawyers.map(lawyer => {
            if (lawyer.profilePicUri && lawyer.profilePicUri.includes('file:///')) {
                lawyer.profilePicUri = ""; 
            }
            if (lawyer.licensePicUri && lawyer.licensePicUri.includes('file:///')) {
                lawyer.licensePicUri = ""; 
            }
            return lawyer;
        });
        
        return res.status(200).json({
            success: true,
            count: sanitizedLawyers.length,
            data: sanitizedLawyers
        });
    } catch (err) {
        console.error("Database Cluster Fetch Error:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to load active lawyers dataset.", 
            error: err.message 
        });
    }
};

// ==========================================
// 5. GET USER PROFILE (GENERIC)
// ==========================================
exports.getUserProfile = async (req, res) => {
    try {
        let userId = req.params.id;
        
        // --- ADDED SAFETY CLEANUP ---
        if (typeof userId === 'string') {
            userId = userId.replace(/['"\[\]]/g, '').replace('object Object', '').trim();
        }
        // --------------------------

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.log("❌ Invalid User ID received:", userId);
            return res.status(400).json({ success: false, message: "Invalid or malformed User ID" });
        }

        const lawyer = await Lawyer.findById(userId).select('-password').lean();
        if (lawyer) return res.status(200).json({ ...lawyer, role: 'Lawyer' });
        
        const client = await Client.findById(userId).select('-password').lean();
        if (client) return res.status(200).json({ ...client, role: 'Client' });
        
        return res.status(404).json({ success: false, message: "User not found" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ==========================================
// 6. UPDATE PROFILE (DYNAMIC BASED ON ROLE)
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const role = req.user.role;

        console.log(`✏️ Profile Update Request received for User ID: ${userId} | Role: ${role}`);

        if (role === 'Client') {
            const { name, phone, city, district, province, profilePic } = req.body;
            const updateFields = {};
            if (name) updateFields.name = name;
            if (phone) updateFields.phone = phone;
            if (profilePic !== undefined) updateFields.profilePic = profilePic;

            // Handle nested address fields
            if (city !== undefined || district !== undefined || province !== undefined) {
                const client = await Client.findById(userId);
                const currentAddress = client ? client.address : {};
                updateFields.address = {
                    city: city !== undefined ? city : (currentAddress.city || ""),
                    district: district !== undefined ? district : (currentAddress.district || ""),
                    province: province !== undefined ? province : (currentAddress.province || "")
                };
            }

            const updatedClient = await Client.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true }
            ).select('-password');

            if (!updatedClient) return res.status(404).json({ success: false, message: "Client not found" });
            return res.status(200).json({ success: true, user: updatedClient });

        } else if (role === 'Lawyer') {
            const updatableFields = [
                'name', 'phone', 'barCouncil', 'licenseNumber', 'courtLevel', 'specialization',
                'experience', 'licenseExpiry', 'city', 'district', 'province', 'cnic', 'bio', 'officeAddress',
                'consultationFee', 'profilePic', 'licensePicUri', 'profilePicUri'
            ];

            const updateFields = {};
            updatableFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateFields[field] = req.body[field];
                }
            });

            if (req.body.areasOfPractice !== undefined) {
                updateFields.areasOfPractice = Array.isArray(req.body.areasOfPractice)
                    ? req.body.areasOfPractice
                    : JSON.parse(req.body.areasOfPractice);
            }

            const updatedLawyer = await Lawyer.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true }
            ).select('-password');

            if (!updatedLawyer) return res.status(404).json({ success: false, message: "Lawyer not found" });
            return res.status(200).json({ success: true, user: updatedLawyer });

        } else if (role === 'Admin') {
            const { email, adminKey } = req.body;
            const updateFields = {};
            if (email) updateFields.email = email.toLowerCase().trim();
            if (adminKey) updateFields.adminKey = adminKey.trim();

            const updatedAdmin = await Admin.findOneAndUpdate(
                {}, // Updates the primary Admin record
                { $set: updateFields },
                { new: true }
            );

            if (!updatedAdmin) return res.status(404).json({ success: false, message: "Admin record not found" });
            return res.status(200).json({ success: true, user: { email: updatedAdmin.email, role: 'Admin' } });
        }

        return res.status(400).json({ success: false, message: "Invalid user role" });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 7. GET RECOMMENDED LAWYERS (SORTED BY CITY & RATINGS)
// ==========================================
exports.getRecommendedLawyers = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const userRole = req.user.role;

        let clientCity = "";

        // Get Client's city if current user is Client
        if (userRole === 'Client') {
            const client = await Client.findById(userId);
            if (client && client.address) {
                clientCity = client.address.city || "";
            }
        }

        // Fetch approved lawyers
        const lawyers = await Lawyer.find({ status: 'approved' }).select('-password').lean();

        // Sort in memory: Client City Match first, then Ratings (averageRating desc, totalReviews desc)
        lawyers.sort((a, b) => {
            const aCity = a.city || "";
            const bCity = b.city || "";
            
            const aCityMatch = clientCity && aCity.toLowerCase().trim() === clientCity.toLowerCase().trim();
            const bCityMatch = clientCity && bCity.toLowerCase().trim() === clientCity.toLowerCase().trim();

            if (aCityMatch && !bCityMatch) return -1;
            if (!aCityMatch && bCityMatch) return 1;

            // Second sorting layer: Rating
            const aRating = a.averageRating || 0;
            const bRating = b.averageRating || 0;
            if (bRating !== aRating) {
                return bRating - aRating;
            }

            // Third sorting layer: Review Count
            const aReviews = a.totalReviews || 0;
            const bReviews = b.totalReviews || 0;
            return bReviews - aReviews;
        });

        return res.status(200).json({ success: true, count: lawyers.length, data: lawyers, clientCity });
    } catch (error) {
        console.error("Get Recommended Lawyers Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 8. UPDATE PASSWORD SYSTEM
// ==========================================
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const role = req.user.role;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Current password and new password are required!" });
        }

        let userModel = role === 'Lawyer' ? Lawyer : Client;
        const userObj = await userModel.findById(userId);

        if (!userObj) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const isMatch = await bcrypt.compare(currentPassword, userObj.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect current password!" });
        }

        const salt = await bcrypt.genSalt(10);
        userObj.password = await bcrypt.hash(newPassword, salt);
        await userObj.save();

        return res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        console.error("Update Password Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 9. GOOGLE LOGIN SYSTEM
// ==========================================
exports.googleLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: "ID Token is required" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email not provided by Google" });
        }

        const searchEmail = email.toLowerCase().trim();

        // 1. Check if user exists in either collection
        let user = await Client.findOne({ email: searchEmail });
        let userRole = 'Client';

        if (!user) {
            user = await Lawyer.findOne({ email: searchEmail });
            if (user) userRole = 'Lawyer';
        }

        // 2. If user exists, log them in
        if (user) {
            // Check suspension
            if (user.isSuspended) {
                if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
                    // Auto lift
                    user.isSuspended = false;
                    user.suspendedUntil = null;
                    user.suspensionReason = "";
                    await user.save();
                } else {
                    const expiryMsg = user.suspendedUntil 
                        ? `until ${new Date(user.suspendedUntil).toLocaleDateString()}` 
                        : "permanently";
                    return res.status(403).json({ 
                        success: false, 
                        isSuspended: true, 
                        message: `Your account has been suspended ${expiryMsg}. Reason: ${user.suspensionReason || "Admin decision"}` 
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Login Successful",
                token: generateToken(user._id, userRole),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: userRole,
                    profilePicUri: user.profilePicUri || user.profilePic || ""
                }
            });
        }

        // 3. If user doesn't exist, register them
        const defaultRole = role || 'Client';
        const salt = await bcrypt.genSalt(10);
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);

        if (defaultRole === 'Lawyer') {
            const newLawyer = new Lawyer({
                name: name || "Google Lawyer",
                email: searchEmail,
                password: hashedPassword,
                phone: "N/A",
                profilePicUri: picture || "",
                profilePic: picture || "",
                role: 'Lawyer',
                status: 'pending',
                isApproved: false
            });
            await newLawyer.save();
            return res.status(201).json({
                success: true,
                message: "Registration Successful",
                token: generateToken(newLawyer._id, 'Lawyer'),
                user: {
                    id: newLawyer._id,
                    name: newLawyer.name,
                    email: newLawyer.email,
                    role: 'Lawyer',
                    profilePicUri: newLawyer.profilePicUri
                }
            });
        } else {
            const newClient = new Client({
                name: name || "Google Client",
                email: searchEmail,
                password: hashedPassword,
                phone: "N/A",
                profilePicUri: picture || "",
                profilePic: picture || "",
                role: 'Client'
            });
            await newClient.save();
            return res.status(201).json({
                success: true,
                message: "Registration Successful",
                token: generateToken(newClient._id, 'Client'),
                user: {
                    id: newClient._id,
                    name: newClient.name,
                    email: newClient.email,
                    role: 'Client',
                    profilePicUri: newClient.profilePicUri
                }
            });
        }

    } catch (err) {
        console.error("Google Auth Error:", err);
        return res.status(500).json({ success: false, message: "Google Authentication failed", error: err.message });
    }
};

// ==========================================
// 10. FACEBOOK LOGIN SYSTEM
// ==========================================
exports.facebookLogin = async (req, res) => {
    try {
        const { accessToken, role } = req.body;
        if (!accessToken) {
            return res.status(400).json({ success: false, message: "Access Token is required" });
        }

        // Verify token with Facebook Graph API
        const fbUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`;
        const fbResponse = await axios.get(fbUrl);
        const { email, name, picture } = fbResponse.data;

        const searchEmail = email ? email.toLowerCase().trim() : `${fbResponse.data.id}@facebook.com`;

        // 1. Check if user exists in either collection
        let user = await Client.findOne({ email: searchEmail });
        let userRole = 'Client';

        if (!user) {
            user = await Lawyer.findOne({ email: searchEmail });
            if (user) userRole = 'Lawyer';
        }

        // 2. If user exists, log them in
        if (user) {
            // Check suspension
            if (user.isSuspended) {
                if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
                    // Auto lift
                    user.isSuspended = false;
                    user.suspendedUntil = null;
                    user.suspensionReason = "";
                    await user.save();
                } else {
                    const expiryMsg = user.suspendedUntil 
                        ? `until ${new Date(user.suspendedUntil).toLocaleDateString()}` 
                        : "permanently";
                    return res.status(403).json({ 
                        success: false, 
                        isSuspended: true, 
                        message: `Your account has been suspended ${expiryMsg}. Reason: ${user.suspensionReason || "Admin decision"}` 
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Login Successful",
                token: generateToken(user._id, userRole),
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: userRole,
                    profilePicUri: user.profilePicUri || user.profilePic || ""
                }
            });
        }

        // 3. If user doesn't exist, register them
        const defaultRole = role || 'Client';
        const salt = await bcrypt.genSalt(10);
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        const pictureUrl = picture && picture.data ? picture.data.url : "";

        if (defaultRole === 'Lawyer') {
            const newLawyer = new Lawyer({
                name: name || "Facebook Lawyer",
                email: searchEmail,
                password: hashedPassword,
                phone: "N/A",
                profilePicUri: pictureUrl,
                profilePic: pictureUrl,
                role: 'Lawyer',
                status: 'pending',
                isApproved: false
            });
            await newLawyer.save();
            return res.status(201).json({
                success: true,
                message: "Registration Successful",
                token: generateToken(newLawyer._id, 'Lawyer'),
                user: {
                    id: newLawyer._id,
                    name: newLawyer.name,
                    email: newLawyer.email,
                    role: 'Lawyer',
                    profilePicUri: newLawyer.profilePicUri
                }
            });
        } else {
            const newClient = new Client({
                name: name || "Facebook Client",
                email: searchEmail,
                password: hashedPassword,
                phone: "N/A",
                profilePicUri: pictureUrl,
                profilePic: pictureUrl,
                role: 'Client'
            });
            await newClient.save();
            return res.status(201).json({
                success: true,
                message: "Registration Successful",
                token: generateToken(newClient._id, 'Client'),
                user: {
                    id: newClient._id,
                    name: newClient.name,
                    email: newClient.email,
                    role: 'Client',
                    profilePicUri: newClient.profilePicUri
                }
            });
        }

    } catch (err) {
        console.error("Facebook Auth Error:", err);
        return res.status(500).json({ success: false, message: "Facebook Authentication failed", error: err.message });
    }
};