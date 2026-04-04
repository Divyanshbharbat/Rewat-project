const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMessages,
    getRecipients,
    sendMessage
} = require('../controllers/messageController');

router.get('/', protect, getMessages);
router.get('/recipients', protect, getRecipients);
router.post('/', protect, sendMessage);

module.exports = router;
