const multer = require("multer");

// Multer Memory Storage for Bulk Imports (XLSX, CSV)
// This configuration uses memory storage since bulk import files
// are processed in memory and don't need to be persisted to disk
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for bulk import files
  },
  fileFilter: (req, file, cb) => {
    // Allow CSV and Excel formats for bulk import
    const allowedMimeTypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];

    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const fileExtension = file.originalname
      .toLowerCase()
      .slice(file.originalname.lastIndexOf("."));

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExtension)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only CSV and Excel files are allowed. Received: ${file.mimetype || fileExtension}`,
        ),
        false,
      );
    }
  },
});

module.exports = uploadMemory;
