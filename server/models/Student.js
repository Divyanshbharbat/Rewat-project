const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    studentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String },
    class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    guardianInfo: {
      fatherName: { type: String },
      fatherPhone: { type: String },
      motherName: { type: String },
      motherPhone: { type: String },
    },
    academicInfo: {
      subjectsCount: { type: Number, default: 0 },
      classRank: { type: String },
    },
    department: { type: String },
    admissionDate: { type: Date, default: Date.now },
    profilePhoto: { type: String },
    attendance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
