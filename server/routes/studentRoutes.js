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
        if (!studentRecord) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const classes = await Class.find({ students: studentRecord._id });
        const classIds = classes.map(c => c._id);
        const assignments = await Assignment.find({ classId: { $in: classIds } }).sort({ dueDate: 1 });

        res.json({
            classesCount: classes.length,
            attendance: `${studentRecord?.attendance || 0}%`,
            avgGrade: studentRecord?.academicInfo?.avgGrade || '87%', // Using academicInfo or fallback
            assignmentsCount: assignments.length,
            assignments: assignments.map(a => ({
                title: a.title,
                dueDate: a.dueDate,
                priority: a.priority || 'medium'
            })),
            schedule: classes.map(c => ({
                subject: c.className,
                time: c.schedule || '9:00 AM - 10:30 AM',
                date: 'Today'
            }))
        });
    } catch (error) {
        console.error('Student Dashboard Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get Student profile
// @route   GET /api/student/profile
// @access  Private/Student
router.get('/profile', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get Student schedule
// @route   GET /api/student/schedule
// @access  Private/Student
router.get('/schedule', protect, authorize('student'), async (req, res) => {
    try {
        const studentRecord = await Student.findOne({ userId: req.user._id });
        if (!studentRecord) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        const classes = await Class.find({ students: studentRecord._id }).populate('teacher', 'name');
        const schedule = classes.map(c => ({
            id: c._id,
            subject: c.className,
            class: `${c.className}-${c.section}`,
            teacher: c.teacher?.name || 'Assigned soon',
            time: c.schedule || '9:00 AM - 10:30 AM',
            room: c.roomNumber || 'TBD',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] // Simplified for now
        }));
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get Student attendance details
// @route   GET /api/student/attendance
// @access  Private/Student
router.get('/attendance', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        // Subject-wise attendance (mocked based on classes for now)
        const classes = await Class.find({ students: student._id });
        const subjectAttendance = classes.map(c => ({
            subject: c.className,
            attended: 28, // Mock
            total: 30,    // Mock
            percentage: 93
        }));

        res.json({
            overall: student?.attendance || 95,
            present: 229,
            absent: 11,
            totalClasses: 240,
            subjectWise: subjectAttendance,
            recentActivity: [
                { day: 'Monday', date: 'Jan 26, 2026', status: 'Present', count: 3 },
                { day: 'Friday', date: 'Jan 25, 2026', status: 'Present', count: 3 },
                { day: 'Thursday', date: 'Jan 24, 2026', status: 'Present', count: 3 }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
