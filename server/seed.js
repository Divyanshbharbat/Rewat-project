const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Class = require("./models/Class");
const Activity = require("./models/Activity");
const Event = require("./models/Event");
const Assignment = require("./models/Assignment");
const Attendance = require("./models/Attendance");
const Grade = require("./models/Grade");
const Message = require("./models/Message");

dotenv.config();

const users = [
  {
    name: "Admin User",
    email: "admin@school.com",
    password: "password123",
    role: "admin",
  },
  {
    name: "John Teacher",
    email: "teacher@school.com",
    password: "password123",
    role: "teacher",
  },
  {
    name: "Jane Student",
    email: "student@school.com",
    password: "password123",
    role: "student",
  },
];

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/schoolerp",
    );

    console.log("Cleaning database...");
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Class.deleteMany();
    await Activity.deleteMany();
    await Event.deleteMany();
    await Assignment.deleteMany();

    console.log("Seeding users...");
    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const admin = createdUsers.find((u) => u.role === "admin");
    const teacher = createdUsers.find((u) => u.role === "teacher");
    const student = createdUsers.find((u) => u.role === "student");

    console.log("Seeding additional data...");

    // Create Teacher record
    await Teacher.create({
      teacherId: "TEACH001",
      name: "John Teacher",
      email: "teacher@school.com",
      subject: "Mathematics",
    });

    // Create Student record
    const studentRecord = await Student.create({
      userId: student._id,
      studentId: "STU001",
      firstName: "Jane",
      lastName: "Student",
      email: "student@school.com",
      phone: "+1 234 567 890",
      dateOfBirth: new Date("2010-05-15"),
      gender: "Female",
      address: "123 Education St, Knowledge City",
      bloodGroup: "O+",
      guardianInfo: {
        fatherName: "Mark Student",
        fatherPhone: "+1 234 567 891",
        motherName: "Mary Student",
        motherPhone: "+1 234 567 892",
      },
      academicInfo: {
        subjectsCount: 5,
        classRank: "3rd",
      },
      attendance: 92,
    });

    console.log("Student record created and linked to user");

    // Create Classes
    const class1 = await Class.create({
      className: "Mathematics",
      section: "10-A",
      roomNumber: "201",
      capacity: 30,
      subjects: ["Calculus", "Algebra"],
      students: [studentRecord._id],
    });

    const class2 = await Class.create({
      className: "Physics",
      section: "10-B",
      roomNumber: "305",
      capacity: 30,
      subjects: ["Mechanics", "Thermodynamics"],
      students: [studentRecord._id],
    });

    // Add Activities
    await Activity.create([
      {
        title: "New student enrolled",
        detail: "Jane Student",
        type: "student",
      },
      { title: "New teacher joined", detail: "John Teacher", type: "teacher" },
      { title: "Class Created", detail: "Mathematics 101", type: "class" },
    ]);

    // Add Events
    await Event.create([
      {
        title: "Parent-Teacher Meeting",
        date: new Date("2026-01-28T10:00:00"),
        location: "Hall A",
      },
      {
        title: "Annual Sports Day",
        date: new Date("2026-02-05T09:00:00"),
        location: "Field 1",
      },
    ]);

    // Add Assignments
    console.log("Seeding assignments...");
    const assignment1 = await Assignment.create({
      title: "Calculus Homework",
      subject: "Calculus",
      dueDate: new Date("2026-01-28"),
      classId: class1._id,
      teacherId: teacher._id,
    });

    await Assignment.create({
      title: "Physics Lab Report",
      subject: "Physics",
      dueDate: new Date("2026-01-30"),
      classId: class2._id,
      teacherId: teacher._id,
    });

    // Add Attendance records for Jane Student
    console.log("Seeding attendance...");
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        // Skip weekends
        await Attendance.create({
          studentId: studentRecord._id,
          classId: class1._id,
          subject: "Mathematics",
          date: date,
          status: i === 3 ? "Absent" : "Present",
        });
      }
    }

    // Add Grade records for Jane Student
    console.log("Seeding grades...");
    await Grade.create([
      {
        studentId: studentRecord._id,
        classId: class1._id,
        subject: "Mathematics",
        marks: "89",
        teacherId: teacher._id,
      },
      {
        studentId: studentRecord._id,
        classId: class2._id,
        subject: "Physics",
        marks: "83",
        teacherId: teacher._id,
      },
    ]);

    // Add Message records
    console.log("Seeding messages...");
    await Message.create([
      {
        senderId: teacher._id,
        receiverId: student._id,
        message:
          "Hello Jane, don't forget to submit your Calculus homework by tomorrow.",
        timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
      },
      {
        senderId: student._id,
        receiverId: teacher._id,
        message:
          "Hello Sir, I have already started working on it. I will submit it on time.",
        timestamp: new Date(Date.now() - 3600000 * 23), // 23 hours ago
      },
      {
        senderId: admin._id,
        receiverId: student._id,
        message:
          "Welcome to the school portal, Jane! Explore your dashboard to see your performance.",
        timestamp: new Date(Date.now() - 3600000 * 48), // 2 days ago
      },
    ]);

    console.log(
      "Database Seeded Successfully with full relational and activity data",
    );
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    if (mongoose.connection) await mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
