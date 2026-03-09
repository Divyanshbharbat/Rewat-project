const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getStudentsReport,
    getTeachersReport,
    getClassesReport
} = require('../controllers/reportController');

router.get('/students', protect, getStudentsReport);
router.get('/teachers', protect, getTeachersReport);
router.get('/classes', protect, getClassesReport);

module.exports = router;
