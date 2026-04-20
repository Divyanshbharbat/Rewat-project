const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { askAI } = require('../controllers/chatbotController');

// Only allow Admins to use the AI Chatbot as requested
router.post('/ask', protect, authorize('admin'), askAI);

module.exports = router;
