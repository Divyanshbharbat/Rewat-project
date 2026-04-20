const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: { type: String, required: true },
    section: { type: String, required: true },
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roomNumber: { type: String },
    capacity: { type: Number },
    subjects: [{ type: String }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    /** Time range shown on timetables, e.g. "9:00 AM - 10:30 AM" */
    schedule: { type: String, default: '9:00 AM - 10:30 AM' },
    /** Which weekdays this class meets (names must match UI ordering) */
    weekdays: {
        type: [String],
        default: () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
}, { timestamps: true });

// prevent duplicate class-section combos
classSchema.index({ className: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
