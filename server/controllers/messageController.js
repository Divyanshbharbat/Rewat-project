const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

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

    // Get all users with allowed roles (except current user)
    const allUsers = await User.find({
      _id: { $ne: req.user.id },
      role: { $in: allowedRoles },
    }).select("_id name email role");

    // Get active students and teachers (not deleted) with their IDs
    const activeStudents = await Student.find({
      isDeleted: { $ne: true },
    })
      .select("userId studentId")
      .sort({ studentId: 1 });

    const activeTeachers = await Teacher.find({
      isDeleted: { $ne: true },
    })
      .select("userId teacherId")
      .sort({ teacherId: 1 });

    const activeStudentMap = new Map(
      activeStudents.map((s) => [s.userId?.toString(), s.studentId]),
    );
    const activeTeacherMap = new Map(
      activeTeachers.map((t) => [t.userId?.toString(), t.teacherId]),
    );

    // Filter and add ID information
    let recipients = allUsers
      .filter((user) => {
        if (user.role === "student") {
          return activeStudentMap.has(user._id.toString());
        } else if (user.role === "teacher") {
          return activeTeacherMap.has(user._id.toString());
        }
        return true; // Keep admins
      })
      .map((user) => ({
        ...user.toObject(),
        studentId: activeStudentMap.get(user._id.toString()),
        teacherId: activeTeacherMap.get(user._id.toString()),
      }));

    // Sort: teachers by teacherId, students by studentId
    recipients.sort((a, b) => {
      const aId = a.teacherId || a.studentId || "";
      const bId = b.teacherId || b.studentId || "";
      return aId.localeCompare(bId, undefined, { numeric: true });
    });

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

// GET /api/messages/unread-count
// Returns { total, perSender: [{ _id, count, senderName }] }
const getUnreadCount = async (req, res) => {
  try {
    const receiverId = new mongoose.Types.ObjectId(req.user.id);

    const total = await Message.countDocuments({
      receiverId,
      isRead: false,
    });

    const perSender = await Message.aggregate([
      { $match: { receiverId, isRead: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },
      {
        $project: {
          _id: 1,
          count: 1,
          senderName: "$sender.name",
        },
      },
    ]);

    res.json({ total, perSender });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/messages/read/:senderId
// Marks all unread messages from senderId → current user as read
const markAsRead = async (req, res) => {
  try {
    const senderId = new mongoose.Types.ObjectId(req.params.senderId);
    const receiverId = new mongoose.Types.ObjectId(req.user.id);

    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/messages/clear/:contactId
// Removes every message exchanged between current user and contactId
const clearChat = async (req, res) => {
  try {
    const contactId = new mongoose.Types.ObjectId(req.params.contactId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId },
      ],
    });

    res.json({ message: "Chat cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  getRecipients,
  sendMessage,
  getUnreadCount,
  markAsRead,
  clearChat,
};
