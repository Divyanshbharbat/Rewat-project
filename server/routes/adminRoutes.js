const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Activity = require('../models/Activity');
const Event = require('../models/Event');
const Teacher = require('../models/Teacher');

// @desc    Get Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const classCount = await Class.countDocuments();

        // Mocking attendance avg for now but based on real student records
        const studentRecords = await Student.find();
        const avgAttendance = studentRecords.length > 0
            ? (studentRecords.reduce((acc, s) => acc + (s.attendance || 0), 0) / studentRecords.length).toFixed(1)
            : 0;

        res.json({
            totalStudents: studentCount,
            totalTeachers: teacherCount,
            activeClasses: classCount,
            avgAttendance: `${avgAttendance}%`,
            recentActivities: await Activity.find().sort({ timestamp: -1 }).limit(5),
            upcomingEvents: await Event.find().sort({ date: 1 }).limit(5)
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get all events
// @route   GET /api/admin/events
// @access  Private/Admin
router.get('/events', protect, authorize('admin'), async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Create a new event
// @route   POST /api/admin/events
// @access  Private/Admin
router.post('/events', protect, authorize('admin'), async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).json({ message: 'Validation error', error: error.message });
    }
});

// @desc    Update an event
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
router.put('/events/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: 'Update error', error: error.message });
    }
});

// @desc    Delete an event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
router.delete('/events/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Delete error', error: error.message });
    }
});

module.exports = router;
