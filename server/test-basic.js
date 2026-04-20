const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const test = async () => {
    const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Try the most basic way
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log(result.response.text());
    } catch (e) {
        console.error("Error:", e);
    }
};

test();
