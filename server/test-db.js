const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Class = require('./models/Class');
const Assignment = require('./models/Assignment');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schoolerp');
        console.log('Connected');

        const user = await User.findOne({ email: 'student@school.com' });
        if (!user) {
            console.log('NO USER');
            return;
        }
        console.log('User found:', user._id);

        // --- DASHBOARD ROUTE LOGIC ---
        const studentRecord = await Student.findOne({ userId: user._id });
        if (!studentRecord) {
            console.log('Student record not found');
            return;
        }
        console.log('Student record found:', studentRecord._id);

        const classes = await Class.find({ students: studentRecord._id });
        console.log('Classes found:', classes.length);

        const classIds = classes.map(c => c._id);
        console.log('Class IDs:', classIds);

        const assignments = await Assignment.find({ classId: { $in: classIds } }).sort({ dueDate: 1 });
        console.log('Assignments found:', assignments.length);

        const result = {
            classesCount: classes.length,
            attendance: `${studentRecord?.attendance || 0}%`,
            avgGrade: studentRecord?.academicInfo?.avgGrade || '87%',
            assignmentsCount: assignments.length,
            assignments: assignments.map(a => ({
                title: a.title,
                dueDate: a.dueDate,
                priority: a.priority || 'medium'
            })),
            schedule: classes.map(c => ({
                subject: c.className,
                time: c.schedule || '9:00 AM - 10:30 AM',
                date: 'Today'
            }))
        };
        console.log('RESULT SUCCESS:', JSON.stringify(result, null, 2));

        await mongoose.connection.close();
    } catch (err) {
        console.error('DIAGNOSTIC FAILED:', err);
    }
};

test();
