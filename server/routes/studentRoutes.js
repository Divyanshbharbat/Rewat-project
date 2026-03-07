const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');

// @desc    Get Student dashboard data
// @route   GET /api/student/dashboard
// @access  Private/Student
router.get('/dashboard', protect, authorize('student'), async (req, res) => {
    try {
        const studentRecord = await Student.findOne({ userId: req.user._id });
        const classes = await Class.find({ students: req.user._id });
        const assignments = await Assignment.find({ studentId: req.user._id }).sort({ dueDate: 1 });

        res.json({
            classesCount: classes.length,
            attendance: `${studentRecord?.attendance || 0}%`,
            avgGrade: `${studentRecord?.performance || 0}%`,
            assignmentsCount: assignments.length,
            assignments: assignments.map(a => ({
                title: a.title,
                subject: a.subject,
                dueDate: a.dueDate,
                priority: a.priority
            })),
            schedule: classes.map(c => ({
                subject: c.name,
                time: c.schedule || '9:00 AM - 10:30 AM',
                date: 'Today'
            }))
        });
    } catch (error) {
        console.error('Student Dashboard Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
