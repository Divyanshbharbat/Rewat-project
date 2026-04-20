const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const listModels = async () => {
    const apiKey = "AIzaSyB921tjUJ_We3ZjsXIfTkPq2gc7AkmVKEg";
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // There is no listModels on GoogleGenerativeAI class directly in some versions
        // Let's try to check the prototype or just try 'gemini-1.5-pro'
        
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
        for (const m of models) {
            try {
                console.log(`Checking ${m}...`);
                const model = genAI.getGenerativeModel({ model: m });
                const res = await model.generateContent("test");
                console.log(`Working: ${m}`);
                return;
            } catch (err) {
                console.log(`Failed ${m}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error("General Error:", error);
    }
};

listModels();
