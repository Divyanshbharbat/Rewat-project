const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Class = require('../models/Class');

const getGrades = async (req, res) => {
    try {
        const { classId } = req.params;
        const { subject } = req.query;

        // Fetch the class first
        const targetClass = await Class.findById(classId);
        if (!targetClass) return res.status(404).json({ message: 'Class not found' });

        // Fetch students directly from Student model
        const students = await Student.find({ class: classId });

        // Fetch existing grades for this class and subject
        const query = { classId };
        if (subject) query.subject = subject;
        const existingGrades = await Grade.find(query);

        // Map students to their grades
        const studentsWithGrades = students.map(student => {
            const gradeRecord = existingGrades.find(g => g.studentId.toString() === student._id.toString());
            return {
                _id: student._id,
                name: `${student.firstName} ${student.lastName}`,
                email: student.email,
                marks: gradeRecord ? gradeRecord.marks : '',
                gradeId: gradeRecord ? gradeRecord._id : null
            };
        });

        res.json(studentsWithGrades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignGrade = async (req, res) => {
    try {
        const { studentId, subject, marks, classId } = req.body;
        
        const filter = { studentId, classId, subject };
        const update = { marks, teacherId: req.user.id };
        
        const grade = await Grade.findOneAndUpdate(filter, update, {
            upsert: true,
            new: true
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
