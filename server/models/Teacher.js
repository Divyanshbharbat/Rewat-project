const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    subject: { type: String, required: true },
    department: { type: String },
    joiningDate: { type: Date, default: Date.now },
    address: { type: String },
    profilePhoto: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
