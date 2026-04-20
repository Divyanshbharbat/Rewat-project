const mongoose = require("mongoose");

const BulkImportSchema = new mongoose.Schema(
  {
    importType: {
      type: String,
      enum: ["students", "teachers"],
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalRows: {
      type: Number,
      required: true,
    },
    processedRows: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    // Progress percentage for real-time UI updates (0-100)
    progressPercentage: {
      type: Number,
      default: 0,
    },
    successfulRecords: [
      {
        id: String,
        email: String,
        name: String,
        type: String, // "student" or "teacher"
        userId: mongoose.Schema.Types.ObjectId,
      },
    ],
    failedRecords: [
      {
        rowNumber: Number,
        data: mongoose.Schema.Types.Mixed,
        errors: [String],
      },
    ],
    // Secure storage: hashed credentials (for reference only)
    credentialsHash: String,
    // Flag to track if credentials have been downloaded
    credentialsDownloaded: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    errorLog: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BulkImport", BulkImportSchema);
