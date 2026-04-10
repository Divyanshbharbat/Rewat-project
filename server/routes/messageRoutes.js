const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getMessages,
  getRecipients,
  sendMessage,
} = require("../controllers/messageController");

// All routes require authentication - authorization logic is handled in controller
router.get("/", protect, getMessages);
router.get("/recipients", protect, getRecipients);
router.post("/", protect, sendMessage);

module.exports = router;
