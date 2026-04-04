const Student = require('../models/Student');
const User = require('../models/User');

const getStudents = async (req, res) => {
    try {
        const query = {};
        if (req.query.classId) query.class = req.query.classId;
        const students = await Student.find(query).populate('class');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('class');
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;
        const fullName = `${firstName} ${lastName}`;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create user for the student
            // Default password is their phone number as requested
            user = await User.create({
                name: fullName,
                email,
                password: phone || 'password123',
                role: 'student'
            });
        }

        const newStudent = new Student({
            ...req.body,
            userId: user._id
        });
        
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};
