const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const getTeacherClasses = async (req, res) => {
  try {
    // Make sure we fetch classes using req.user.id for 'teacher' 
    // If testing fails, fallback to find classes where the Teacher _id matches user.email
    let classes = await Class.find({ teacher: req.user.id }).populate('students');
    
    // Auto-map existing classes if this is an older DB schema layout
    if (classes.length === 0) {
        const teacherProfile = await Teacher.findOne({ email: req.user.email });
        if (teacherProfile) {
            classes = await Class.find({ classTeacher: teacherProfile._id }).populate('students');
        }
    }

    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherProfile = async (req, res) => {
    try {
        let teacher = await Teacher.findOne({ email: req.user.email });
        if (!teacher) {
            teacher = await User.findById(req.user.id);
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTeacherProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndUpdate(
            { email: req.user.email },
            req.body,
            { new: true }
        );
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacherDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { classId, subject } = req.query;
        
        // Fetch teacher profile to get profile ID if needed
        const teacherProfile = await Teacher.findOne({ userId: userId });
        const teacherProfileId = teacherProfile ? teacherProfile._id : null;

        // Fetch classes assigned to this teacher (either via direct user ID or profile ID)
        const teacherClasses = await Class.find({ 
            $or: [
                { teacher: userId },
                { classTeacher: teacherProfileId }
            ] 
        }).populate('students');
        
        const classesCount = teacherClasses.length;
        
        // Filter classes if classId is provided
        const filteredClasses = classId ? teacherClasses.filter(c => c._id.toString() === classId) : teacherClasses;
        const filteredClassIds = filteredClasses.map(c => c._id);

        // Calculate total unique students in the teacher's classes
        const students = await Student.find({ class: { $in: filteredClassIds } });
        const totalStudents = students.length;

        // Fetch assignments created by this teacher
        const assignments = await Assignment.find({ teacherId: userId });
        const pendingAssignments = assignments.length;

        // Calculate Average Attendance for the selected classes and subjects
        const attendanceQuery = { classId: { $in: filteredClassIds } };
        if (subject) attendanceQuery.subject = subject;
        
        const attendanceRecords = await Attendance.find(attendanceQuery);
        const totalAttendance = attendanceRecords.length;
        const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
        const avgAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

        // Generate dynamic schedule based on classes and their primary subjects
        const schedule = await Promise.all(filteredClasses.map(async c => {
            const classStudentsCount = await Student.countDocuments({ class: c._id });
            const classSubject = (c.subjects && Array.isArray(c.subjects) && c.subjects.length > 0) 
                ? c.subjects[0] 
                : (subject || 'General');

            return {
                subject: classSubject,
                class: `${c.className || 'Unknown'} - ${c.section || 'N/A'}`,
                time: '09:00 AM - 10:30 AM', // Default slot for now
                students: `${classStudentsCount} Students`
            };
        }));

        res.json({
            classesCount,
            totalStudents,
            pendingAssignments,
            avgAttendance: `${avgAttendance}%`,
            classesToday: filteredClasses.length,
            schedule
        });
    } catch (error) {
        console.error('Teacher Dashboard Error:', error);
        res.status(500).json({ 
            message: 'Error loading dashboard data', 
            error: error.message 
        });
    }
};

const DEFAULT_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getTeacherSchedule = async (req, res) => {
    try {
        const userId = req.user.id;
        let classes = await Class.find({ teacher: userId }).populate('students', 'firstName lastName');

        if (classes.length === 0) {
            const teacherProfile = await Teacher.findOne({ email: req.user.email });
            if (teacherProfile) {
                classes = await Class.find({ classTeacher: teacherProfile._id }).populate(
                    'students',
                    'firstName lastName',
                );
            }
        }

        const slots = classes.map((c) => {
            const subs = c.subjects || [];
            const subtitle = subs.length ? subs.join(' · ') : 'General';
            const weekdays =
                Array.isArray(c.weekdays) && c.weekdays.length ? c.weekdays : DEFAULT_WEEKDAYS;
            return {
                id: c._id,
                title: c.className,
                subtitle,
                section: c.section,
                classLabel: `${c.className} — ${c.section}`,
                time: c.schedule || '9:00 AM - 10:30 AM',
                room: c.roomNumber || 'TBD',
                weekdays,
                studentCount: Array.isArray(c.students) ? c.students.length : 0,
            };
        });

        res.json({
            slots,
            context: {
                role: 'teacher',
                headline: 'Teaching schedule',
                subline: 'Classes you instruct this term',
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeacherClasses,
    getTeacherProfile,
    updateTeacherProfile,
    getTeacherDashboard,
    getTeacherSchedule,
};
