const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    detail: { type: String, required: true },
    type: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
