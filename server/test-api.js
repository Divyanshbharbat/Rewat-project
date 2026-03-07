const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const testRoutes = async () => {
    // Generate a test token for admin
    const adminToken = jwt.sign({ id: '65ccdfd7c2a2b28100818b9c', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    try {
        console.log('Testing Admin Stats...');
        const res = await axios.get(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('Admin Stats Success:', res.data);
    } catch (error) {
        console.error('Admin Stats Error:', error.response ? error.response.data : error.message);
    }

    // Generate a test token for teacher
    const teacherToken = jwt.sign({ id: '65ccdfd7c2a2b28100818b9d', role: 'teacher' }, JWT_SECRET, { expiresIn: '1h' });

    try {
        console.log('\nTesting Teacher Dashboard...');
        const res = await axios.get(`${API_URL}/teacher/dashboard`, {
            headers: { 'Authorization': `Bearer ${teacherToken}` }
        });
        console.log('Teacher Dashboard Success:', res.data);
    } catch (error) {
        console.error('Teacher Dashboard Error:', error.response ? error.response.data : error.message);
    }
};

testRoutes();
