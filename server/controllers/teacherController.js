const Teacher = require('../models/Teacher');
const User = require('../models/User');

const getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createTeacher = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        console.log('Creating teacher for:', email, phone);

        // Check if user already exists
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create user for the teacher
            // Default password is their phone number as requested
            user = await User.create({
                name,
                email,
                password: phone || 'password123',
                role: 'teacher'
            });
        }

        console.log('User for teacher:', user._id);

        const newTeacher = new Teacher({
            ...req.body,
            userId: user._id
        });
        
        console.log('New teacher object:', newTeacher);
        const savedTeacher = await newTeacher.save();
        console.log('Saved teacher:', savedTeacher._id);
        res.status(201).json(savedTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedTeacher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        await Teacher.findByIdAndDelete(req.params.id);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher
};
