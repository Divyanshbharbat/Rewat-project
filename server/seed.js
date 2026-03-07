const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Activity = require('./models/Activity');
const Event = require('./models/Event');
const Assignment = require('./models/Assignment');

dotenv.config();

const users = [
    { name: 'Admin User', email: 'admin@school.com', password: 'password123', role: 'admin' },
    { name: 'John Teacher', email: 'teacher@school.com', password: 'password123', role: 'teacher' },
    { name: 'Jane Student', email: 'student@school.com', password: 'password123', role: 'student' }
];

const seedDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schoolerp');

        console.log('Cleaning database...');
        await User.deleteMany();
        await Student.deleteMany();
        await Teacher.deleteMany();
        await Class.deleteMany();
        await Activity.deleteMany();
        await Event.deleteMany();
        await Assignment.deleteMany();

        console.log('Seeding users...');
        const createdUsers = [];
        for (const u of users) {
            const user = await User.create(u);
            createdUsers.push(user);
        }

        const admin = createdUsers.find(u => u.role === 'admin');
        const teacher = createdUsers.find(u => u.role === 'teacher');
        const student = createdUsers.find(u => u.role === 'student');

        console.log('Seeding additional data...');

        // Create Teacher record
        await Teacher.create({
            userId: teacher._id,
            subject: 'Mathematics',
            experience: '5 years'
        });

        // Create Student record
        await Student.create({
            userId: student._id,
            grade: '10th',
            attendance: 96,
            performance: 87
        });

        // Create Classes
        const class1 = await Class.create({
            name: 'Mathematics 101',
            room: '201',
            teacher: teacher._id,
            students: [student._id],
            schedule: '9:00 AM - 10:30 AM'
        });

        const class2 = await Class.create({
            name: 'Physics 101',
            room: '305',
            teacher: teacher._id,
            students: [student._id],
            schedule: '11:00 AM - 12:30 PM'
        });

        // Add Activities
        await Activity.create([
            { title: 'New student enrolled', detail: 'Jane Student', type: 'student' },
            { title: 'New teacher joined', detail: 'John Teacher', type: 'teacher' },
            { title: 'Class Created', detail: 'Mathematics 101', type: 'class' }
        ]);

        // Add Events
        await Event.create([
            { title: 'Parent-Teacher Meeting', date: new Date('2026-01-28T10:00:00'), location: 'Hall A' },
            { title: 'Annual Sports Day', date: new Date('2026-02-05T09:00:00'), location: 'Field 1' }
        ]);

        // Add Assignments
        await Assignment.create([
            { title: 'Calculus Homework', subject: 'Mathematics', dueDate: new Date('2026-01-28'), priority: 'high', classId: class1._id, studentId: student._id },
            { title: 'Physics Lab Report', subject: 'Physics', dueDate: new Date('2026-01-30'), priority: 'medium', classId: class2._id, studentId: student._id }
        ]);

        console.log('Database Seeded Successfully with full relational and activity data');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
};

seedDB();
