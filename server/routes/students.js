const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const multer = require("multer");
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { bulkImportStudents } = require("../controllers/bulkImportController");
const Class = require("../models/Class");

// Configure multer for Excel / CSV files
// Accepts all common MIME types browsers send for these formats,
// including generic octet-stream when the OS doesn't recognize the extension.
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel",                                           // .xls
      "text/csv",                                                            // .csv
      "application/csv",
      "application/octet-stream",  // some browsers send this for .xlsx/.csv
    ];
    const allowedExtensions = /\.(xlsx|xls|csv)$/i;

    const mimeOk = allowedMimes.includes(file.mimetype);
    const extOk  = allowedExtensions.test(file.originalname);

    if (mimeOk || extOk) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV file. Received MIME: ${file.mimetype}`
        )
      );
    }
  },
});

// ── Debug endpoint: list all available classes ───────────────────────────────
router.get("/debug/classes", protect, authorize("admin"), async (req, res) => {
  try {
    const classes = await Class.find();
    res.json({
      count: classes.length,
      classes: classes.map((c) => ({
        id: c._id,
        className: c.className,
        section: c.section,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Bulk import — MUST be defined before /:id to avoid route conflict ────────
router.post(
  "/bulk-import",
  protect,
  authorize("admin"),
  excelUpload.single("file"),
  bulkImportStudents
);

// ── Standard CRUD routes ─────────────────────────────────────────────────────
router.get("/",      protect, getStudents);
router.get("/:id",   protect, getStudentById);
router.post("/",     protect, createStudent);
router.put("/:id",   protect, updateStudent);
router.delete("/:id", protect, deleteStudent);

module.exports = router;
