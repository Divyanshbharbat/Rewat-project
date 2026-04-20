const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  submitAssignment,
  getAssignmentSubmissions,
  getStudentSubmissionStatus,
} = require("../controllers/submissionController");

// @route   POST /api/submissions/upload
// @desc    Submit an assignment (Student)
router.post(
  "/upload",
  protect,
  authorize("student"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        const errorMessage = err.message || "File upload error";
        console.error("Multer Error:", err);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({
              message: "File size limit exceeded. Maximum 5MB allowed.",
            });
        }
        if (err.message.includes("Only PDF")) {
          return res
            .status(400)
            .json({ message: "Only PDF files are allowed" });
        }
        return res.status(400).json({ message: errorMessage });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file was uploaded" });
      }

      next();
    });
  },
  submitAssignment,
);

// @route   GET /api/submissions/my-status
// @desc    Get student's submission status
router.get(
  "/my-status",
  protect,
  authorize("student"),
  getStudentSubmissionStatus,
);

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment (Teacher)
router.get(
  "/assignment/:assignmentId",
  protect,
  authorize("teacher"),
  getAssignmentSubmissions,
);

module.exports = router;
