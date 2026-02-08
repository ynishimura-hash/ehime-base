
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

async function testPrompt() {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const candidates = [
        {
            id: 0,
            value: "柔軟な視点",
            course: "リスキル大学講座アーカイブ",
            context: "過去の講座をアーカイブとして視聴可能です。"
        },
        {
            id: 1,
            value: "好奇心旺盛",
            course: "DX推進担当者育成カリキュラム",
            context: "DX推進に必要な基礎知識から実践的なスキルまでを網羅的に学習します。"
        }
    ];

    const prompt = `
            Role: Expert Career Psychologist.
            Task: Generate a highly personalized recommendation message (max 100 chars, Japanese) for each User Value + Recommended Course pair.
            
            Input Data:
            ${JSON.stringify(candidates)}

            Output Schema (JSON Array of objects):
            [ { "id": number, "message": "string" } ]
            `;

    console.log('Testing Gemini 2.5 Flash Lite with prompt...');
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log('Raw Response:', text);

        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

testPrompt();
