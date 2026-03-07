const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schoolerp');
        const users = await User.find({});
        console.log('Total users in DB:', users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}), role: ${u.role}, hash: ${u.password.substring(0, 10)}...`);
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUsers();
