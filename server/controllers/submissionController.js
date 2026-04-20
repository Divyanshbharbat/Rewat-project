const Submission = require("../models/Submission");
const Student = require("../models/Student");
const path = require("path");

const submitAssignment = async (req, res) => {
  try {
    console.log("Submission Payload:", req.body, req.file?.filename);
    const { assignmentId } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    const student = await Student.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (!student) {
      console.error(
        "Student not found for userId:",
        req.user._id,
        "email:",
        req.user.email,
      );
      return res
        .status(404)
        .json({ message: "Student record not found. Please contact admin." });
    }

    console.log("Submission Student Found:", student._id);

    // Check if already submitted
    let submission = await Submission.findOne({
      studentId: student._id,
      assignmentId,
    });

    const fileUrl = `/uploads/submissions/${req.file.filename}`;

    if (submission) {
      // Update existing submission
      submission.fileUrl = fileUrl;
      submission.fileName = req.file.originalname;
      submission.submittedAt = Date.now();
      await submission.save();
      console.log("Updated submission:", submission._id);
    } else {
      // Create new submission
      submission = new Submission({
        studentId: student._id,
        assignmentId,
        fileUrl,
        fileName: req.file.originalname,
        submittedAt: Date.now(),
      });
      await submission.save();
      console.log("Created new submission:", submission._id);
    }

    res.status(201).json({
      ...submission.toObject(),
      message: "Assignment submitted successfully",
    });
  } catch (error) {
    console.error("Submit Assignment Error:", error);
    res.status(500).json({
      message: "Server error. Unable to submit assignment. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!assignmentId) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate({
        path: "studentId",
        select: "firstName lastName email studentId userId",
        options: { lean: true },
      })
      .sort({ submittedAt: -1 })
      .lean();

    if (!submissions || submissions.length === 0) {
      return res.json([]);
    }

    // Validate fileUrl exists for each submission
    const validSubmissions = submissions.map((sub) => ({
      ...sub,
      fileUrl: sub.fileUrl || `/uploads/submissions/${sub.fileName}`,
    }));

    console.log("Returning submissions:", validSubmissions);
    res.json(validSubmissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getStudentSubmissionStatus = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.json([]);

    const submissions = await Submission.find({ studentId: student._id });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitAssignment,
  getAssignmentSubmissions,
  getStudentSubmissionStatus,
};
