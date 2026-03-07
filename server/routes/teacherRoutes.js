const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');

// @desc    Get Teacher dashboard data
// @route   GET /api/teacher/dashboard
// @access  Private/Teacher
router.get('/dashboard', protect, authorize('teacher'), async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user._id });
        const studentCount = classes.reduce((acc, c) => acc + c.students.length, 0);
        const assignments = await Assignment.countDocuments({ classId: { $in: classes.map(c => c._id) } });

        res.json({
            classesCount: classes.length,
            totalStudents: studentCount,
            pendingAssignments: assignments,
            classesToday: classes.length,
            schedule: classes.map(c => ({
                subject: c.name,
                class: `Room ${c.room}`,
                time: c.schedule || '9:00 AM - 10:30 AM',
                students: `${c.students.length} students`
            }))
        });
    } catch (error) {
        console.error('Teacher Dashboard Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
