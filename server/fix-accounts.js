const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

dotenv.config();

const fixAccounts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schoolerp');
        
        console.log('--- Fixing Teacher accounts ---');
        const teachers = await Teacher.find({});
        for (const teacher of teachers) {
            let user = await User.findOne({ email: teacher.email });
            if (!user) {
                console.log(`Creating User account for Teacher: ${teacher.name} (${teacher.email})`);
                // Use phone as password, or default
                const password = teacher.phone || 'password123';
                user = await User.create({
                    name: teacher.name,
                    email: teacher.email,
                    password: password,
                    role: 'teacher'
                });
                teacher.userId = user._id;
                await teacher.save();
                console.log(`Successfully created and linked User for ${teacher.email}`);
            } else {
                if (!teacher.userId) {
                    console.log(`Linking existing User ${user._id} to Teacher ${teacher.email}`);
                    teacher.userId = user._id;
                    await teacher.save();
                }
            }
        }

        console.log('\n--- Fixing Student accounts ---');
        const students = await Student.find({});
        for (const student of students) {
            let user = await User.findOne({ email: student.email });
            if (!user) {
                console.log(`Creating User account for Student: ${student.firstName} ${student.lastName} (${student.email})`);
                const password = student.phone || 'password123';
                user = await User.create({
                    name: `${student.firstName} ${student.lastName}`,
                    email: student.email,
                    password: password,
                    role: 'student'
                });
                student.userId = user._id;
                await student.save();
                console.log(`Successfully created and linked User for ${student.email}`);
            } else {
                if (!student.userId) {
                    console.log(`Linking existing User ${user._id} to Student ${student.email}`);
                    student.userId = user._id;
                    await student.save();
                }
            }
        }

        console.log('\nDone.');
        process.exit();
    } catch (error) {
        console.error('Error fixing accounts:', error);
        process.exit(1);
    }
};

fixAccounts();
