const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: { type: String, required: true },
    section: { type: String, required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomNumber: { type: String },
    capacity: { type: Number },
    subjects: [{ type: String }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

// prevent duplicate class-section combos
classSchema.index({ className: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
