const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getGrades,
    assignGrade,
    updateGrade
} = require('../controllers/gradeController');

router.get('/class/:classId', protect, getGrades);
router.post('/', protect, assignGrade);
router.put('/:id', protect, updateGrade);

module.exports = router;
