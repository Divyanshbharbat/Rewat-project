const User = require('../models/User');
const Message = require('../models/Message');

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id },
                { receiverId: req.user.id }
            ]
        })
            .populate('senderId', 'name email role')
            .populate('receiverId', 'name email role')
            .sort({ timestamp: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecipients = async (req, res) => {
    try {
        // For students, recipients are teachers and admins.
        // For teachers, recipients are admins and students (maybe).
        // For simplicity, let's fetch all users except the current one.
        const recipients = await User.find({
            _id: { $ne: req.user.id },
            role: { $in: ['teacher', 'admin'] }
        }).select('name email role');

        res.json(recipients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const newMessage = new Message({
            senderId: req.user.id,
            receiverId,
            message
        });
        const savedMessage = await newMessage.save();

        await savedMessage.populate('senderId', 'name email role');
        await savedMessage.populate('receiverId', 'name email role');

        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    getRecipients,
    sendMessage
};
