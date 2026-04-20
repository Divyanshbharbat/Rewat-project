const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
const genAI = new GoogleGenerativeAI(apiKey);

async function testV1() {
  try {
    // Try to see if we can get model info 
    // Usually, 404 means the model is NOT available for this key in this region or API version.
    // Let's try gemini-1.5-flash-8b
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const res = await model.generateContent("Hi");
    console.log("Success with 8b:", res.response.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

testV1();
