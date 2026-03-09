const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher
} = require('../controllers/teacherController');

router.get('/', protect, getTeachers);
router.get('/:id', protect, getTeacherById);
router.post('/', protect, createTeacher);
router.put('/:id', protect, updateTeacher);
router.delete('/:id', protect, deleteTeacher);

module.exports = router;
