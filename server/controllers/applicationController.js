const Application = require("../models/Application");
const Student = require("../models/Student");

// Get all applications (Admin only)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("studentId", "firstName lastName email")
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications by status (Admin)
const getApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const applications = await Application.find(query)
      .populate("studentId", "firstName lastName email")
      .populate("userId", "name email")
      .sort({ submittedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's own applications
const getStudentApplications = async (req, res) => {
  try {
    const student = await Student.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const applications = await Application.find({
      studentId: student._id,
    }).sort({ submittedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit new application
const submitApplication = async (req, res) => {
  try {
    const { applicationTitle, description } = req.body;

    if (!applicationTitle || !description) {
      return res.status(400).json({
        message: "Application title and description are required",
      });
    }

    const student = await Student.findOne({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    const newApplication = new Application({
      studentId: student._id,
      userId: req.user._id,
      applicationTitle,
      description,
      status: "Pending",
    });

    const savedApplication = await newApplication.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application: savedApplication,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update application status (Admin only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { id } = req.params;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = {
      status,
      ...(adminNotes && { adminNotes }),
    };

    if (status === "Approved") {
      updateData.approvedAt = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    )
      .populate("studentId", "firstName lastName email")
      .populate("userId", "name email");

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete application
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllApplications,
  getApplicationsByStatus,
  getStudentApplications,
  submitApplication,
  updateApplicationStatus,
  deleteApplication,
};
