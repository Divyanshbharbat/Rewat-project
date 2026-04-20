const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
const genAI = new GoogleGenerativeAI(apiKey);

async function finalTest() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello, are you operational?");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Final Test Failed:", e.message);
  }
}

finalTest();
