const Class = require('../models/Class');
const Student = require('../models/Student');

const getClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('classTeacher');
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getClassById = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id).populate('classTeacher');
        if (!cls) return res.status(404).json({ message: 'Class not found' });
        
        const students = await Student.find({ class: cls._id });
        res.json({ ...cls.toObject(), students });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createClass = async (req, res) => {
    try {
        const newClass = new Class(req.body);
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteClass = async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass
};
