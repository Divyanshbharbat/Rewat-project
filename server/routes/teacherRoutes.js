const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getTeacherClasses,
    getTeacherProfile,
    updateTeacherProfile
} = require('../controllers/teacherDashboardController');

router.get('/classes', protect, getTeacherClasses);
router.get('/profile', protect, getTeacherProfile);
router.put('/profile', protect, updateTeacherProfile);

module.exports = router;
