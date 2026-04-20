const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const testAI = async () => {
    // Using the key provided by the user
    const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
    console.log("Testing with API Key:", apiKey);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Hello, are you working?";
        console.log("Sending prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("AI Response:", text);
    } catch (error) {
        console.error("AI Error:", error.message);
        if (error.stack) console.error(error.stack);
    }
};

testAI();
