const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

// @desc    Get Student grades
// @route   GET /api/student/grades
// @access  Private/Student
router.get('/grades', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({ 
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        });
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        const grades = await Grade.find({ studentId: student._id }).populate('teacherId', 'name');
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Get Student dashboard data
// @route   GET /api/student/dashboard
// @access  Private/Student
router.get('/dashboard', protect, authorize('student'), async (req, res) => {
    try {
        const studentRecord = await Student.findOne({ 
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        });
        if (!studentRecord) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const classId = studentRecord.class;
        const studentClass = classId ? await Class.findById(classId) : null;
        const classesCount = studentClass ? 1 : 0;
        
        const assignments = classId ? await Assignment.find({ classId }).sort({ dueDate: 1 }) : [];

        // Real attendance calculation
        const totalAttendance = await Attendance.countDocuments({ studentId: studentRecord._id });
        const presentCount = await Attendance.countDocuments({ studentId: studentRecord._id, status: 'Present' });
        const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        res.json({
            classesCount,
            attendance: `${attendancePercentage}%`,
            avgGrade: studentRecord?.academicInfo?.classRank || 'N/A', 
            assignmentsCount: assignments.length,
            assignments: assignments.map(a => ({
                _id: a._id,
                title: a.title,
                subject: a.subject,
                dueDate: a.dueDate,
                priority: a.priority || 'medium'
            })),
            schedule: studentClass ? [{
                subject: studentClass.className,
                time: studentClass.schedule || '9:00 AM - 10:30 AM',
                date: 'Today'
            }] : []
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
        const student = await Student.findOne({ 
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        }).populate('class');
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
        const studentRecord = await Student.findOne({ 
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        });
        if (!studentRecord) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        if (!studentRecord.class) {
            return res.json([]);
        }

        const classes = await Class.find({ _id: studentRecord.class }).populate('teacher', 'name');
        const schedule = classes.map(c => ({
            id: c._id,
            subject: c.className,
            class: `${c.className}-${c.section}`,
            teacher: c.teacher?.name || 'Assigned soon',
            time: c.schedule || '9:00 AM - 10:30 AM',
            room: c.roomNumber || 'TBD',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
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
        const student = await Student.findOne({ 
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        });
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const attendanceRecords = await Attendance.find({ studentId: student._id });
        const totalClasses = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
        const absentCount = totalClasses - presentCount;
        const overallPercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

        // Group by subject
        const subjectStats = {};
        attendanceRecords.forEach(r => {
            if (!subjectStats[r.subject]) {
                subjectStats[r.subject] = { attended: 0, total: 0 };
            }
            subjectStats[r.subject].total++;
            if (r.status === 'Present') subjectStats[r.subject].attended++;
        });

        const subjectWise = Object.keys(subjectStats).map(subject => ({
            subject,
            attended: subjectStats[subject].attended,
            total: subjectStats[subject].total,
            percentage: Math.round((subjectStats[subject].attended / subjectStats[subject].total) * 100)
        }));

        res.json({
            overall: overallPercentage,
            present: presentCount,
            absent: absentCount,
            totalClasses: totalClasses,
            subjectWise: subjectWise,
            recentActivity: attendanceRecords.slice(-5).reverse().map(r => ({
                day: new Date(r.date).toLocaleDateString(undefined, { weekday: 'long' }),
                date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                status: r.status,
                subject: r.subject
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
