const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const listModels = async () => {
    const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // SDK might have a method for this, but let's try a simple generation with a known model first
        // actually let's just try 'gemini-1.5-flash' but maybe it needs to be specified differently?
        
        // Let's try 'gemini-1.5-flash-latest' or 'gemini-pro'
        const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];
        
        for (const modelName of models) {
            try {
                console.log(`Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                console.log(`Success with ${modelName}:`, response.text());
                break;
            } catch (e) {
                console.log(`Failed with ${modelName}:`, e.message);
            }
        }
    } catch (error) {
        console.error("List Error:", error.message);
    }
};

listModels();
