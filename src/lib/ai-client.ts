
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

// Initialize the Google Generative AI client
// Note: In a real app, ensure this key is only available server-side or allowed for client usage carefully.
// Here we assume server-side usage primarily.
export const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
};
