import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { title } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API Key not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
        You are an expert e-learning content creator.
        Create a short quiz based on the video title: "${title}".
        
        The quiz should check the understanding of the likely content of this video.
        Format the output strictly as valid JSON with no markdown formatting.
        The JSON structure must be:
        {
            "question": "Question text here (Japanese)",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "The correct option text",
            "explanation": "Brief explanation of why it is correct (Japanese)"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const quizData = JSON.parse(jsonStr);

        return NextResponse.json(quizData);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
    }
}
