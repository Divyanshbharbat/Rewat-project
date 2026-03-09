const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment
} = require('../controllers/assignmentController');

router.get('/teacher', protect, getAssignments);
router.post('/', protect, createAssignment);
router.put('/:id', protect, updateAssignment);
router.delete('/:id', protect, deleteAssignment);

module.exports = router;
