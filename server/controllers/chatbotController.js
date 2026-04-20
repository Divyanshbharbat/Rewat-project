const { GoogleGenerativeAI } = require("@google/generative-ai");
const Settings = require("../models/Settings");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Activity = require("../models/Activity");
const Event = require("../models/Event");

const askAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. Get API Key from settings
    let settings = await Settings.findOne();
    const apiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ 
        message: "Gemini API Key is not configured. Please add it in Chatbot settings." 
      });
    }

    // 2. Gather context from database
    const [studentCount, teacherCount, classCount] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments()
    ]);

    const [teachers, students, recentActivities, upcomingEvents] = await Promise.all([
      Teacher.find({}, 'name subject').limit(20),
      Student.find({}, 'firstName lastName studentId').limit(10),
      Activity.find().sort({ timestamp: -1 }).limit(10),
      Event.find().sort({ date: 1 }).limit(5)
    ]);

    const schoolName = settings?.schoolName || "the School";

    const context = `
      You are an AI Assistant for ${schoolName}'s Management System.
      Current System Statistics:
      - Total Students: ${studentCount}
      - Total Teachers: ${teacherCount}
      - Total Classes: ${classCount}

      Available Teachers:
      ${teachers.map(t => `- ${t.name} (${t.subject})`).join('\n')}

      Recent Students (Subset):
      ${students.map(s => `- ${s.firstName} ${s.lastName} [ID: ${s.studentId}]`).join('\n')}

      Recent Activities:
      ${recentActivities.map(a => `- ${a.title}: ${a.detail} (${new Date(a.timestamp).toLocaleString()})`).join('\n')}

      Upcoming Events:
      ${upcomingEvents.map(e => `- ${e.title} on ${new Date(e.date).toLocaleString()} at ${e.location}`).join('\n')}

      Instructions for AI:
      1. Answer the user's question based on this accurate database information. 
      2. Be helpful and specific.
      3. DO NOT use markdown formatting characters like asterisks (**) or underscores (_) for bolding/italics. 
      4. Use plain text or simple list formats for better readability.
    `;

    // 3. Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${context}\n\nUser Question: ${message}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("AI Chatbot Error:", error);
    res.status(500).json({ 
      message: "Error communicating with AI service", 
      error: error.message 
    });
  }
};

module.exports = { askAI };
