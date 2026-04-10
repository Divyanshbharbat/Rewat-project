const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

router.get("/", protect, getAssignments);
router.post("/", protect, authorize("teacher"), createAssignment);
router.put("/:id", protect, updateAssignment);
router.delete("/:id", protect, deleteAssignment);

module.exports = router;
