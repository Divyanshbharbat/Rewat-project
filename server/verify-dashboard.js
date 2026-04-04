const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');
const Attendance = require('./models/Attendance');

async function testDashboard() {
  await mongoose.connect('mongodb://127.0.0.1:27017/schoolerp');
  const user = await User.findOne({ email: 't@gmail.com' });
  if (!user) {
    console.log('User t@gmail.com not found');
    return;
  }

  const teacherProfile = await Teacher.findOne({ userId: user._id });
  const tId = teacherProfile ? teacherProfile._id : null;
  const teacherClasses = await Class.find({ $or: [{ teacher: user._id }, { classTeacher: tId }] });
  const filteredClassIds = teacherClasses.map(c => c._id);
  const studentsCount = await Student.countDocuments({ class: { $in: filteredClassIds } });
  const assignmentsCount = await Assignment.countDocuments({ teacherId: user._id });
  const attendanceRecords = await Attendance.find({ classId: { $in: filteredClassIds } });

  let avg = 0;
  if (attendanceRecords.length > 0) {
    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    avg = Math.round((presentCount / attendanceRecords.length) * 100);
  }

  console.log('--- Teacher Dashboard Real Data for t@gmail.com ---');
  console.log('User ID:', user._id.toString());
  console.log('Classes Count:', teacherClasses.length);
  console.log('Total Students:', studentsCount);
  console.log('Assignments Found:', assignmentsCount);
  console.log('Average Attendance:', avg + '%');
  console.log('--- End ---');
}

testDashboard().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
