
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SCHEMAS = {
  company: `
    [
      {
        "name": "Company Name",
        "industry": "Industry string",
        "location": "Address string",
        "representative_name": "Representative Name",
        "established_date": "YYYY-MM-DD or string",
        "employee_count": "Number string or integer",
        "capital": "Capital amount string",
        "business_content": "Description of business",
        "phone": "Phone number",
        "website_url": "URL",
        "description": "Long description"
      }
    ]
    `,
  job: `
    [
      {
        "title": "Job Title",
        "type": "job (or quest)",
        "content": "Job content/description",
        "salary": "Salary string (e.g. 300-500万円)",
        "employment_type": "Employment type",
        "working_hours": "Working hours",
        "holidays": "Holidays info",
        "benefits": "Benefits info",
        "qualifications": "Qualifications",
        "access": "Access info",
        "company_name": "Company Name associated"
      }
    ]
    `,
  user: `
    [
      {
        "email": "Email address",
        "full_name": "Full Name",
        "first_name": "First Name (if available)",
        "last_name": "Last Name (if available)",
        "phone": "Phone Number",
        "university": "University Name",
        "faculty": "Faculty/Department",
        "bio": "Self introduction"
      }
    ]
    `,
  course: `
    [
      {
        "title": "Course Title",
        "description": "Course Description",
        "category": "Category",
        "level": "Level (beginner/intermediate/advanced)",
        "duration": "Duration",
        "image": "Image URL if any"
      }
    ]
    `
};

export async function POST(req: NextRequest) {
  try {
    const { csvData, type } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const schema = SCHEMAS[type as keyof typeof SCHEMAS];
    if (!schema) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Limit data size to prevent token limits (take first 50 rows if too large)
    // Convert array of objects (csvData) back to string for prompt efficiency, or just send JSON string
    const dataString = JSON.stringify(csvData.slice(0, 50));

    const prompt = `
        You are an expert data parsing assistant.
        I will provide raw CSV data (converted to JSON format).
        Your task is to transform this data into a structured JSON array that matches the following schema exactly.
        
        Target Schema Keys (use these keys):
        ${schema}

        Rules:
        1. Map the input fields to the target keys intelligently (e.g. "WEBURL" -> "website_url").
        2. Clean and Normalize values:
           - "1,000万円" -> "1000万円" or keep as string but clean.
           - Split names into first/last if needed, or combine.
           - Fix date formats to YYYY-MM-DD if possible.
        3. If a field is missing, omit it or use null.
        4. Return ONLY the JSON array. No markdown formatting.

        Raw Data:
        ${dataString}
        `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean cleanup
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(text);

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error('AI Parse Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
