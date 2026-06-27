const Complaint = require('../models/Complaint');
const Client = require('../models/Client');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const { createAndSendNotification } = require('../services/notificationService');


// 1. Submit a new complaint
exports.submitComplaint = async (req, res) => {
    try {
        const { targetId, bookingId, subject, description, type } = req.body;
        const userId = req.user ? (req.user.id || req.user._id) : null;

        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized." });
        
        // Safety: Ensure targetId is a plain string
        const cleanTargetId = targetId ? targetId.toString() : null;

        if (!cleanTargetId || !bookingId || !subject || !description || !type) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        const evidencePath = req.file ? `/uploads/evidence/${req.file.filename}` : null;

        const complaintData = {
            subject,
            description,
            evidence: evidencePath,
            status: 'pending',
            type: type.toLowerCase(),
            bookingId,
            reportedBy: userId 
        };

        if (type.toLowerCase() === 'client') {
            complaintData.clientId = userId;
            complaintData.lawyerId = cleanTargetId;
        } else {
            complaintData.clientId = cleanTargetId;
            complaintData.lawyerId = userId;
        }

        const newComplaint = await Complaint.create(complaintData);

        // Notify Admins
        const admins = await User.find({ role: 'Admin' });
        for (const admin of admins) {
            await createAndSendNotification(
                admin._id,
                "New User Complaint",
                `A new complaint has been filed by a ${type}: "${subject}"`,
                "complaint",
                { complaintId: newComplaint._id }
            );
        }

        res.status(201).json({ success: true, message: "Complaint submitted successfully", complaint: newComplaint });
    } catch (error) {
        console.error("Submit Complaint Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to populate data (Robust & includes adminResponse)
const populateComplaintData = async (complaints) => {
    return await Promise.all(complaints.map(async (c) => {
        const client = c.clientId ? await Client.findById(c.clientId).select('name profilePic').lean() : null;
        const lawyer = c.lawyerId ? await Lawyer.findById(c.lawyerId).select('name profilePic').lean() : null;
        
        return {
            ...c,
            adminResponse: c.adminResponse || "", 
            clientId: client || { name: 'Client Not Found', profilePic: '' },
            lawyerId: lawyer || { name: 'Lawyer Not Found', profilePic: '' }
        };
    }));
};

// 2. Get all complaints for admin (Active pending/in-progress only)
exports.getAllComplaints = async (req, res) => {
    try {
        const { type } = req.query;
        // Admin active queue filters out warning, suspension, resolved, closed complaints
        const query = {
            status: { $in: ['pending', 'in-progress'] }
        };

        if (type) {
            query.type = { $regex: new RegExp(`^${type}$`, 'i') };
        }

        const complaints = await Complaint.find(query).sort({ createdAt: -1 }).lean();
        const populatedComplaints = await populateComplaintData(complaints);

        res.status(200).json({ success: true, complaints: populatedComplaints });
    } catch (error) {
        console.error("Get Complaints Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get current user's complaints
exports.getMyComplaints = async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.user.id || req.user._id;
        const userRole = req.user.role; // 'Client' or 'Lawyer'

        let query = {};
        if (userRole === 'Lawyer') {
            query.lawyerId = userId;
        } else {
            query.clientId = userId;
        }

        if (status) {
            const statusVal = status.toLowerCase();
            if (statusVal === 'pending') {
                query.status = { $in: ['pending', 'in-progress'] };
            } else if (statusVal === 'warned') {
                query.status = { $in: ['warned', 'suspended'] };
            } else if (statusVal === 'resolved') {
                query.status = { $in: ['resolved', 'closed'] };
            } else {
                query.status = statusVal;
            }
        }
        
        const complaints = await Complaint.find(query).sort({ createdAt: -1 }).lean();
        const populatedComplaints = await populateComplaintData(complaints);

        res.status(200).json({ success: true, complaints: populatedComplaints });
    } catch (error) {
        console.error("Get My Complaints Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Admin update complaint status (with support for suspension days)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, adminComment, suspensionDays } = req.body;
        const validStatuses = ['pending', 'in-progress', 'resolved', 'closed', 'warned', 'suspended'];
        
        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id, 
            { status, adminResponse: adminComment || '' }, 
            { new: true }
        );

        if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

        if (status === 'suspended') {
            const suspensionDaysInt = parseInt(suspensionDays, 10) || 0;
            const suspendedUntil = suspensionDaysInt > 0 
                ? new Date(Date.now() + suspensionDaysInt * 24 * 60 * 60 * 1000) 
                : null;

            // If client files against lawyer, type='client', so suspend lawyer (lawyerId)
            // If lawyer files against client, type='lawyer', so suspend client (clientId)
            const targetId = complaint.type === 'client' ? complaint.lawyerId : complaint.clientId;
            const targetModel = complaint.type === 'client' ? Lawyer : Client;

            if (targetId) {
                await targetModel.findByIdAndUpdate(targetId, {
                    isSuspended: true,
                    suspendedUntil,
                    suspensionReason: adminComment || "Account suspended by Admin"
                });
            }
        } else if (status === 'warned') {
            complaint.warningAccepted = false;
            await complaint.save();
        }

        // Notify reporting user
        if (complaint.reportedBy) {
            await createAndSendNotification(
                complaint.reportedBy,
                "Complaint Update",
                `Your complaint regarding "${complaint.subject}" has been marked as ${status}.`,
                "complaint",
                { complaintId: complaint._id }
            );
        }

        // Notify target user if warned or suspended
        if (status === 'warned' || status === 'suspended') {
            const targetId = complaint.type === 'client' ? complaint.lawyerId : complaint.clientId;
            if (targetId) {
                await createAndSendNotification(
                    targetId,
                    status === 'suspended' ? "Account Suspended ⚠️" : "Warning Issued ⚠️",
                    status === 'suspended' 
                      ? `Your account has been suspended by Admin. Reason: ${adminComment || 'Violation of guidelines'}` 
                      : `A warning has been issued to you by Admin. Subject: ${complaint.subject}. Please acknowledge.`,
                    "complaint",
                    { complaintId: complaint._id }
                );
            }
        }

        res.status(200).json({ success: true, message: "Complaint updated successfully", complaint });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Get single complaint details by ID
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).lean();
        if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

        const [populated] = await populateComplaintData([complaint]);
        res.status(200).json({ success: true, complaint: populated });
    } catch (error) {
        console.error("Get Complaint By Id Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Acknowledge warning by target user
exports.acknowledgeWarning = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

        const targetId = complaint.type === 'client' ? complaint.lawyerId.toString() : complaint.clientId.toString();
        if (targetId !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to accept this warning" });
        }

        complaint.warningAccepted = true;
        complaint.status = 'closed';
        await complaint.save();

        res.status(200).json({ success: true, message: "Warning acknowledged successfully" });
    } catch (error) {
        console.error("Acknowledge Warning Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Delete complaint (by reporter, client, or lawyer if status is resolved/closed)
exports.deleteComplaint = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }

        const isAuthorized = 
            complaint.reportedBy.toString() === userId.toString() ||
            complaint.clientId.toString() === userId.toString() ||
            complaint.lawyerId.toString() === userId.toString();

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this complaint" });
        }

        if (complaint.status !== 'resolved' && complaint.status !== 'closed') {
            return res.status(400).json({ success: false, message: "Only resolved or closed complaints can be deleted" });
        }

        await Complaint.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Complaint deleted successfully" });
    } catch (error) {
        console.error("Delete Complaint Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};