const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

const getStudentsReport = async (req, res) => {
    try {
        const students = await Student.find().populate('class');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTeachersReport = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getClassesReport = async (req, res) => {
    try {
        const classes = await Class.find().populate('classTeacher');
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getStudentsReport,
    getTeachersReport,
    getClassesReport
};
