const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignmentController');

router.get('/', protect, authorize('teacher'), getAssignments);
router.post('/', protect, createAssignment);
router.put('/:id', protect, updateAssignment);
router.delete('/:id', protect, deleteAssignment);

module.exports = router;
