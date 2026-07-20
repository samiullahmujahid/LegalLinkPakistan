// ==========================================
// IMPORTS & MODELS
// ==========================================
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Lawyer = require('../models/Lawyer');
const Admin = require('../models/Admin');

// ==========================================
// 1. JWT PROTECT MIDDLEWARE & SUSPENSION CHECK
// ==========================================
const protect = async (req, res, next) => {
    let token;

    // 1. Authorization header check
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            // 2. Token extract
            token = authHeader.split(' ')[1];

            // 3. Clean quotes
            if (token && (token.startsWith('"') || token.startsWith("'"))) {
                token = token.slice(1, -1);
            }

            // 4. Verify token
            const secretKey = process.env.JWT_SECRET || 'secret';
            const decoded = jwt.verify(token, secretKey);
            const userId = decoded.id || decoded._id;

            if (!userId) {
                console.error("DEBUG: No ID found in token!");
                return res.status(401).json({ success: false, message: 'Invalid token payload.' });
            }

            // 5. Role based user lookup
            let user = null;
            let userRole = decoded.role;

            // Priority: Verify role from token first
            if (userRole === 'Admin') {
                user = await Admin.findById(userId).select('-password');
            } else if (userRole === 'Lawyer') {
                user = await Lawyer.findById(userId).select('-password');
            } else if (userRole === 'Client') {
                user = await Client.findById(userId).select('-password');
            }
            
            // Fallback: Safety check if role-based lookup fails
            if (!user) {
                user = await Admin.findById(userId).select('-password');
                if (user) userRole = 'Admin';
            }
            if (!user) {
                user = await Lawyer.findById(userId).select('-password');
                if (user) userRole = 'Lawyer';
            }
            if (!user) {
                user = await Client.findById(userId).select('-password');
                if (user) userRole = 'Client';
            }

            // 6. User exist check
            if (!user) {
                console.error("DEBUG: User not found in database. ID:", userId);
                return res.status(401).json({ success: false, message: 'User not found in DB.' });
            }

            // ==========================================
            // SUSPENSION CHECK & AUTO-LIFT
            // ==========================================
            if (user.isSuspended) {
                if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
                    // Auto lift suspension
                    user.isSuspended = false;
                    user.suspendedUntil = null;
                    user.suspensionReason = "";
                    if (userRole === 'Lawyer') {
                        await Lawyer.findByIdAndUpdate(userId, { isSuspended: false, suspendedUntil: null, suspensionReason: "" });
                    } else if (userRole === 'Client') {
                        await Client.findByIdAndUpdate(userId, { isSuspended: false, suspendedUntil: null, suspensionReason: "" });
                    }
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

            // 7. Success
            req.user = {
                ...user.toObject(),
                role: userRole 
            };
            
            return next();
            
        } catch (error) {
            console.error('❌ Middleware Token Error:', error.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Token verification failed: ' + error.message 
            });
        }
    }

    // 8. No token case
    if (!token) {
        console.error("DEBUG: Token missing in header");
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token provided.' 
        });
    }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = { protect };