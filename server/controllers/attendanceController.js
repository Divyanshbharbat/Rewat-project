const Attendance = require('../models/Attendance');

const getAttendanceByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const attendances = await Attendance.find({ classId }).populate('studentId');
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const markAttendance = async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendanceByClass,
    markAttendance
};
