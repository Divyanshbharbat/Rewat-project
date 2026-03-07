const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/admin', require('./routes/adminRoutes.js'));
app.use('/api/teacher', require('./routes/teacherRoutes.js'));
app.use('/api/student', require('./routes/studentRoutes.js'));
app.get('/', (req, res) => {
    res.send('SchoolERP API is running...');
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/schoolerp';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
