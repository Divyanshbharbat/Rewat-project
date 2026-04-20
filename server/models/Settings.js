const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    schoolName: { type: String, required: true, default: 'School Name' },
    schoolLogo: { type: String },
    address: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    geminiApiKey: { type: String, default: 'AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
