const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); // Create default if none exists
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = await Settings.create(req.body);
        }
        res.json(settings);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
