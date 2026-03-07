const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grade: { type: String, required: true },
    attendance: { type: Number, default: 0 },
    performance: { type: Number, default: 0 },
    enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
