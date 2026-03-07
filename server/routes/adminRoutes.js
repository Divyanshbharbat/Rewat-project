const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Activity = require('../models/Activity');
const Event = require('../models/Event');

// @desc    Get Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
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

module.exports = router;
