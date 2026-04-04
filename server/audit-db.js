const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

dotenv.config();

const auditDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schoolerp');
        
        console.log('--- USERS ---');
        const users = await User.find({});
        users.forEach(u => console.log(`[User] ${u.name} (${u.email}) role: ${u.role}`));

        console.log('\n--- TEACHERS ---');
        const teachers = await Teacher.find({});
        teachers.forEach(t => console.log(`[Teacher] ${t.name} (${t.email}) phone: ${t.phone} userId: ${t.userId}`));

        console.log('\n--- STUDENTS ---');
        const students = await Student.find({});
        students.forEach(s => console.log(`[Student] ${s.firstName} ${s.lastName} (${s.email}) phone: ${s.phone} userId: ${s.userId}`));

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

auditDB();
