const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAttendanceByClass,
    markAttendance
} = require('../controllers/attendanceController');

router.get('/class/:classId', protect, getAttendanceByClass);
router.post('/', protect, markAttendance);

module.exports = router;
