const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getTeacherClasses,
    getTeacherProfile,
    updateTeacherProfile,
    getTeacherDashboard,
    getTeacherSchedule,
} = require('../controllers/teacherDashboardController');

router.get('/dashboard', protect, getTeacherDashboard);
router.get('/schedule', protect, getTeacherSchedule);
router.get('/classes', protect, getTeacherClasses);
router.get('/profile', protect, getTeacherProfile);
router.put('/profile', protect, updateTeacherProfile);

module.exports = router;
