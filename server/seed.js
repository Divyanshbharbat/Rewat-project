const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Class = require("./models/Class");
const Activity = require("./models/Activity");
const Event = require("./models/Event");
const Assignment = require("./models/Assignment");

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
    await Student.create({
      studentId: "STU001",
      firstName: "Jane",
      lastName: "Student",
      email: "student@school.com",
    });

    // Create Classes
    const class1 = await Class.create({
      className: "Mathematics",
      section: "10-A",
      roomNumber: "201",
      capacity: 30,
      subjects: ["Calculus", "Algebra"],
    });

    const class2 = await Class.create({
      className: "Physics",
      section: "10-B",
      roomNumber: "305",
      capacity: 30,
      subjects: ["Mechanics", "Thermodynamics"],
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
    await Assignment.create([
      {
        title: "Calculus Homework",
        dueDate: new Date("2026-01-28"),
        classId: class1._id,
        teacherId: teacher._id,
      },
      {
        title: "Physics Lab Report",
        dueDate: new Date("2026-01-30"),
        classId: class2._id,
        teacherId: teacher._id,
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
