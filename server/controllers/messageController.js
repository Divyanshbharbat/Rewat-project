const User = require("../models/User");
const Message = require("../models/Message");

// Determine allowed recipients based on sender role
const getAllowedRecipients = (userRole) => {
  const roleMap = {
    student: ["teacher", "admin"], // Students can message teachers and admins
    teacher: ["admin", "student"], // Teachers can message admins and students
    admin: ["teacher", "student"], // Admins can message teachers and students
  };
  return roleMap[userRole] || [];
};

// Check if sender can message receiver
const canMessage = (senderRole, receiverRole) => {
  const allowedRoles = getAllowedRecipients(senderRole);
  return allowedRoles.includes(receiverRole);
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }],
    })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecipients = async (req, res) => {
  try {
    const userRole = req.user.role;
    const allowedRoles = getAllowedRecipients(userRole);

    if (allowedRoles.length === 0) {
      return res.json([]);
    }

    const recipients = await User.find({
      _id: { $ne: req.user.id },
      role: { $in: allowedRoles },
    }).select("_id name email role");

    res.json(recipients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderRole = req.user.role;

    // Get receiver user data
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Check if sender is allowed to message this receiver
    if (!canMessage(senderRole, receiver.role)) {
      return res.status(403).json({
        message: `${senderRole}s cannot message ${receiver.role}s`,
      });
    }

    // Check that sender is not messaging themselves
    if (receiverId === req.user.id) {
      return res.status(400).json({ message: "Cannot message yourself" });
    }

    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      message,
    });
    const savedMessage = await newMessage.save();

    await savedMessage.populate("senderId", "name email role");
    await savedMessage.populate("receiverId", "name email role");

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  getRecipients,
  sendMessage,
};
