const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    dueDate: { type: Date, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
