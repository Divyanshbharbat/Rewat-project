const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    subject: { type: String },
    department: { type: String },
    joiningDate: { type: Date, default: Date.now },
    address: { type: String },
    profilePhoto: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Teacher", teacherSchema);
