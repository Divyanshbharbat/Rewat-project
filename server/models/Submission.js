const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
    marks: { type: String },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
