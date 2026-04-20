const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
});

module.exports = mongoose.model('Event', eventSchema);
