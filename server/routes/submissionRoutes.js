const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { 
    submitAssignment, 
    getAssignmentSubmissions, 
    getStudentSubmissionStatus 
} = require('../controllers/submissionController');

// @route   POST /api/submissions/upload
// @desc    Submit an assignment (Student)
router.post('/upload', protect, authorize('student'), (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        next();
    });
}, submitAssignment);

// @route   GET /api/submissions/my-status
// @desc    Get student's submission status
router.get('/my-status', protect, authorize('student'), getStudentSubmissionStatus);

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment (Teacher)
router.get('/assignment/:assignmentId', protect, authorize('teacher'), getAssignmentSubmissions);

module.exports = router;
