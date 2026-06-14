const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');router.post('/ask', protect, aiController.askLegalAI);
router.post('/generate-image', protect, aiController.generateImageAI);

module.exports = router;