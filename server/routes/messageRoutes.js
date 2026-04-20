const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMessages,
  getRecipients,
  sendMessage,
  getUnreadCount,
  markAsRead,
  clearChat,
} = require("../controllers/messageController");

// All routes require authentication
router.get("/unread-count", protect, getUnreadCount);
router.put("/read/:senderId", protect, markAsRead);
router.delete("/clear/:contactId", protect, clearChat);
router.get("/", protect, getMessages);
router.get("/recipients", protect, getRecipients);
router.post("/", protect, sendMessage);

module.exports = router;

