
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
    console.log("Loaded .env.local");
} else {
    // Fallback to default .env if no .env.local
    dotenv.config();
}

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key:", apiKey ? `Present (Starts with ${apiKey.substring(0, 4)}...)` : "Missing");
    if (!apiKey) {
        console.log("Please set GEMINI_API_KEY in .env.local");
        return;
    }

    const models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-lite-preview-02-05", // Try specific preview if available 
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-pro"
    ];

    for (const m of models) {
        try {
            console.log(`Trying model: ${m}`);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello, respond with 'OK'");
            console.log(`API Call Success with ${m}:`, result.response.text());
            return;
        } catch (e: any) {
            console.error(`API Call Failed with ${m}:`, e.message.substring(0, 150) + "...");
        }
    }
}
main();
