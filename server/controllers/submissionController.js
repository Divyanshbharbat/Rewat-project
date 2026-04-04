const Submission = require('../models/Submission');
const Student = require('../models/Student');
const path = require('path');

const submitAssignment = async (req, res) => {
    try {
        console.log('Submission Payload:', req.body, req.file);
        const { assignmentId } = req.body;
        if (!assignmentId) {
            return res.status(400).json({ message: 'Assignment ID is required' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file' });
        }

        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            console.error('Student not found for userId:', req.user._id);
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        console.log('Submission Student Found:', student._id);

        // Check if already submitted
        let submission = await Submission.findOne({ 
            studentId: student._id, 
            assignmentId 
        });

        const fileUrl = `/uploads/submissions/${req.file.filename}`;

        if (submission) {
            // Update existing submission
            submission.fileUrl = fileUrl;
            submission.fileName = req.file.originalname;
            submission.submittedAt = Date.now();
            await submission.save();
        } else {
            // Create new submission
            submission = new Submission({
                studentId: student._id,
                assignmentId,
                fileUrl,
                fileName: req.file.originalname
            });
            await submission.save();
        }

        res.status(201).json(submission);
    } catch (error) {
        console.error('Submit Assignment Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const submissions = await Submission.find({ assignmentId })
            .populate('studentId', 'firstName lastName email studentId');
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudentSubmissionStatus = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) return res.json([]);
        
        const submissions = await Submission.find({ studentId: student._id });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    submitAssignment,
    getAssignmentSubmissions,
    getStudentSubmissionStatus
};
