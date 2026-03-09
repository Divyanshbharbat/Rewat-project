const Grade = require('../models/Grade');

const getGrades = async (req, res) => {
    try {
        const grades = await Grade.find({ classId: req.params.classId }).populate('studentId');
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignGrade = async (req, res) => {
    try {
        const { studentId, subject, marks, classId } = req.body;
        const grade = await Grade.create({
            studentId, subject, marks, teacherId: req.user.id, classId
        });
        res.json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGrade = async (req, res) => {
    try {
        const grade = await Grade.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(grade);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGrades,
    assignGrade,
    updateGrade
};
