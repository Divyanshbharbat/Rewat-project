const Assignment = require('../models/Assignment');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacherId: req.user.id }).populate('classId');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAssignment = async (req, res) => {
    try {
        const { title, description, classId, dueDate, subject } = req.body;
        if (!subject) return res.status(400).json({ message: 'Subject is required' });
        
        const assignment = new Assignment({
            title, description, classId, dueDate, subject, teacherId: req.user.id
        });
        const savedAssignment = await assignment.save();
        res.status(201).json(savedAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndUpdate(
            { _id: req.params.id, teacherId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        await Assignment.findOneAndDelete({ _id: req.params.id, teacherId: req.user.id });
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
};
