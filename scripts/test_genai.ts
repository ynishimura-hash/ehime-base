
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('Missing GEMINI_API_KEY');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    // Test 3: Gemini 2.5 Flash Lite (Explicit)
    try {
        console.log('\nTesting gemini-2.5-flash-lite...');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent("Hello, are you available?");
        console.log('Gemini 2.5 Flash Lite Response:', result.response.text());
    } catch (error: any) {
        console.error('Gemini 2.5 Flash Lite Error:', error.message);
    }

    try {
        console.log('\nTesting gemini-2.5-flash-lite with JSON mode...');
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json"
            }
        });
        const result = await model.generateContent('{"message": "hello"}');
        console.log('Response:', result.response.text());
    } catch (error: any) {
        console.error('JSON Mode failed:', error.statusText || error.message);
    }
}

test();
