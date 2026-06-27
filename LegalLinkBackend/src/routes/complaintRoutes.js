const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');
const { 
    submitComplaint, 
    getAllComplaints, 
    updateComplaintStatus,
    getMyComplaints,
    getComplaintById,
    acknowledgeWarning,
    deleteComplaint
} = require('../controllers/complaintController');

// Multer storage configuration for evidence uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/evidence/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Configure upload limits (Optional: set file size limit to 5MB if needed)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ==========================================
// COMPLAINT ROUTES
// ==========================================

// 1. Submit a new complaint (Requires Auth + File Upload)
router.post('/submit', protect, upload.single('evidence'), submitComplaint);

// 2. Get current user's complaints
router.get('/my-complaints', protect, getMyComplaints);

// 3. Get all complaints (Admin use)
router.get('/all', protect, getAllComplaints);

// 4. Update complaint status (Admin use)
router.put('/status/:id', protect, updateComplaintStatus);

// 5. Get single complaint details
router.get('/detail/:id', protect, getComplaintById);

// 6. Acknowledge warning by target
router.put('/acknowledge/:id', protect, acknowledgeWarning);

// 7. Delete complaint
router.delete('/delete/:id', protect, deleteComplaint);

module.exports = router;