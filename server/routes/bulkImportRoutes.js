const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const {
  bulkImportStudents,
  bulkImportTeachers,
  getImportStatus,
  getErrorReport,
  getCredentialsExport,
} = require("../controllers/bulkImportController");
const BulkImport = require("../models/BulkImport");

// ============================================================================
// BULK IMPORT ENDPOINTS
// ============================================================================

// @desc    Bulk import students
// @route   POST /api/bulk-import/students
// @access  Private/Admin
router.post(
  "/students",
  protect,
  authorize("admin"),
  uploadMiddleware.single("file"),
  bulkImportStudents,
);

// @desc    Bulk import teachers
// @route   POST /api/bulk-import/teachers
// @access  Private/Admin
router.post(
  "/teachers",
  protect,
  authorize("admin"),
  uploadMiddleware.single("file"),
  bulkImportTeachers,
);

// ============================================================================
// PROGRESS & STATUS ENDPOINTS
// ============================================================================

// @desc    Get import progress status
// @route   GET /api/bulk-import/:importId/status
// @access  Private/Admin
// Returns: status, progressPercentage, processedRows, totalRows, successCount, failureCount
router.get("/:importId/status", protect, authorize("admin"), getImportStatus);

// ============================================================================
// EXPORT ENDPOINTS
// ============================================================================

// @desc    Export failed records as CSV
// @route   GET /api/bulk-import/:importId/errors
// @access  Private/Admin
// Returns: CSV file with error details
router.get("/:importId/errors", protect, authorize("admin"), getErrorReport);

// @desc    Export successful records as CSV
// @route   GET /api/bulk-import/:importId/credentials
// @access  Private/Admin
// Returns: CSV file with successfully imported records
router.get(
  "/:importId/credentials",
  protect,
  authorize("admin"),
  getCredentialsExport,
);

// ============================================================================
// STATISTICS & HISTORY
// ============================================================================

// @desc    Get import statistics
// @route   GET /api/bulk-import/stats/summary
// @access  Private/Admin
router.get("/stats/summary", protect, authorize("admin"), async (req, res) => {
  try {
    const totalImports = await BulkImport.countDocuments();
    const successfulImports = await BulkImport.countDocuments({
      status: "completed",
    });
    const failedImports = await BulkImport.countDocuments({ status: "failed" });

    const studentImports = await BulkImport.find({
      importType: "students",
    }).lean();
    const teacherImports = await BulkImport.find({
      importType: "teachers",
    }).lean();

    const totalStudentsImported = studentImports.reduce(
      (sum, imp) => sum + imp.successCount,
      0,
    );
    const totalTeachersImported = teacherImports.reduce(
      (sum, imp) => sum + imp.successCount,
      0,
    );

    res.json({
      totalImports,
      successfulImports,
      failedImports,
      totalStudentsImported,
      totalTeachersImported,
      studentImports: studentImports.length,
      teacherImports: teacherImports.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error });
  }
});

// @desc    Get import history
// @route   GET /api/bulk-import/history
// @access  Private/Admin
router.get("/history", protect, authorize("admin"), async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (type) query.importType = type;

    const imports = await BulkImport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("adminId", "name email");

    const total = await BulkImport.countDocuments(query);

    res.json({
      imports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching import history", error });
  }
});

module.exports = router;
