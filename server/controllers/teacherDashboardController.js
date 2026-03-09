const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

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

module.exports = {
    getTeacherClasses,
    getTeacherProfile,
    updateTeacherProfile
};
