// ==========================================
// IMPORTS & ROUTER SETUP
// ==========================================
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// ==========================================
// 1. AI CHAT & IMAGE GENERATION ROUTES
// ==========================================
router.post('/ask', protect, aiController.askLegalAI);
router.post('/generate-image', protect, aiController.generateImageAI);

// ==========================================
// EXPORTS
// ==========================================
module.exports = router;