const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAllApplications,
  getApplicationsByStatus,
  getStudentApplications,
  submitApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

// Student Routes
router.post("/submit", protect, authorize("student"), submitApplication);
router.get(
  "/my-applications",
  protect,
  authorize("student"),
  getStudentApplications,
);

// Admin Routes
router.get("/all", protect, authorize("admin"), getAllApplications);
router.get("/filter", protect, authorize("admin"), getApplicationsByStatus);
router.put("/:id/status", protect, authorize("admin"), updateApplicationStatus);
router.delete("/:id", protect, authorize("admin"), deleteApplication);

module.exports = router;
