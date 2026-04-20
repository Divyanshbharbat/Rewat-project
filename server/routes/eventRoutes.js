const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect, authorize } = require("../middleware/authMiddleware");

// @desc    Upcoming school events (created by admin) — read-only for teachers & students
// @route   GET /api/events/upcoming
// @access  Private / teacher, student
router.get(
  "/upcoming",
  protect,
  authorize("teacher", "student"),
  async (req, res) => {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const events = await Event.find({ date: { $gte: start } })
        .sort({ date: 1 })
        .limit(50)
        .lean();
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
