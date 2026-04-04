const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');

const getAttendanceByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { subject } = req.query;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        date.setHours(0, 0, 0, 0);

        // Fetch the class first
        const targetClass = await Class.findById(classId);
        if (!targetClass) return res.status(404).json({ message: 'Class not found' });

        // Fetch students directly from Student model to ensure accuracy
        const students = await Student.find({ class: classId });

        // Fetch existing attendance records for this date and subject
        const query = {
            classId,
            date: {
                $gte: date,
                $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
            }
        };
        if (subject) query.subject = subject;

        const existingRecords = await Attendance.find(query);

        // Map students to their attendance status
        const studentsWithAttendance = students.map(student => {
            const record = existingRecords.find(r => r.studentId.toString() === student._id.toString());
            return {
                _id: student._id,
                name: `${student.firstName} ${student.lastName}`,
                email: student.email,
                status: record ? record.status : 'Present' // Default to Present
            };
        });

        res.json(studentsWithAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { classId, attendanceData, date, subject } = req.body;
        if (!subject) return res.status(400).json({ message: 'Subject is required for attendance' });

        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        const results = [];
        for (const item of attendanceData) {
            const filter = {
                studentId: item.studentId,
                classId,
                subject,
                date: attendanceDate
            };
            const update = { status: item.status };
            
            const record = await Attendance.findOneAndUpdate(filter, update, { 
                upsert: true, 
                new: true 
            });
            results.push(record);
        }

        res.status(200).json({ message: 'Attendance updated successfully', results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendanceByClass,
    markAttendance
};
