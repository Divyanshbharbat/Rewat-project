const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const User = require('../models/User');
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
        const studentClass = classId ? await Class.findById(classId).populate('teacher', 'name') : null;
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
            schedule: studentClass
                ? [
                      {
                          subject: studentClass.className,
                          time: studentClass.schedule || '9:00 AM - 10:30 AM',
                          room: studentClass.roomNumber || 'TBD',
                          teacher: studentClass.teacher?.name || 'Assigned soon',
                          date: 'Today',
                      },
                  ]
                : [],
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

// @desc    Update Student profile
// @route   PUT /api/student/profile
// @access  Private/Student
router.put('/profile', protect, authorize('student'), async (req, res) => {
    try {
        const student = await Student.findOne({
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        const { firstName, lastName, phone } = req.body;
        if (firstName !== undefined && firstName !== '') student.firstName = firstName;
        if (lastName !== undefined && lastName !== '') student.lastName = lastName;
        if (phone !== undefined) student.phone = phone;
        await student.save();

        const user = await User.findById(req.user._id);
        if (user && (firstName !== undefined || lastName !== undefined)) {
            const fn = student.firstName || '';
            const ln = student.lastName || '';
            const full = `${fn} ${ln}`.trim();
            if (full) user.name = full;
            await user.save();
        }

        const updated = await Student.findById(student._id).populate('class');
        res.json(updated);
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
        
        const defaultWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        if (!studentRecord.class) {
            return res.json({
                slots: [],
                context: {
                    homeroom: '',
                    subline: 'You are not assigned to a class yet.',
                },
            });
        }

        const classes = await Class.find({ _id: studentRecord.class }).populate('teacher', 'name');
        const slots = classes.map((c) => {
            const subs = c.subjects || [];
            const subtitle = subs.length ? subs.join(' · ') : 'General';
            const weekdays =
                Array.isArray(c.weekdays) && c.weekdays.length ? c.weekdays : defaultWeekdays;
            return {
                id: c._id,
                title: c.className,
                subtitle,
                section: c.section,
                classLabel: `${c.className} — ${c.section}`,
                time: c.schedule || '9:00 AM - 10:30 AM',
                room: c.roomNumber || 'TBD',
                weekdays,
                teacherName: c.teacher?.name || 'Assigned soon',
            };
        });

        res.json({
            slots,
            context: {
                homeroom: slots.length ? slots[0].classLabel : '',
                subline: 'Your weekly class meetings',
            },
        });
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
