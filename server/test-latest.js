const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
const genAI = new GoogleGenerativeAI(apiKey);

async function list() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // This is just to see if the model exists
    console.log("Model requested:", model.model);
    
    // Let's try to use model name 'gemini-1.5-flash-latest'
    const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model2.generateContent("Hi");
    console.log("Success with latest:", result.response.text());
  } catch (e) {
    console.error("Error details:", e);
  }
}

list();
