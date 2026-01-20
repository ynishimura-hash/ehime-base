import { NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-2.0-flash-001';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const { input } = await req.json();

        if (!input) {
            return NextResponse.json({ error: 'Input is required' }, { status: 400 });
        }

        let contentToProcess = input;

        // If input is a URL, fetch the content
        if (input.startsWith('http://') || input.startsWith('https://')) {
            try {
                console.log('Fetching URL:', input);
                const siteRes = await fetch(input, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });
                if (!siteRes.ok) throw new Error(`Failed to fetch site: ${siteRes.statusText}`);
                const html = await siteRes.text();

                // HTML text extraction
                // 1. Remove noise strings (scripts, styles, nav, header, footer)
                let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                    .replace(/<header\b[^>]*>([\s\S]*?)<\/header>/gm, "")
                    .replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gm, "")
                    .replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gm, "");

                // 2. Remove tags
                text = text.replace(/<[^>]+>/g, "\n");

                // 3. Clean whitespace
                contentToProcess = text.replace(/\s+/g, " ").trim().substring(0, 20000); // Limit context size
                console.log('Extracted text length:', contentToProcess.length);
            } catch (fetchError: any) {
                console.error('URL Fetch Error:', fetchError);
                return NextResponse.json({ error: `URL fetch failed: ${fetchError.message}` }, { status: 400 });
            }
        }

        const prompt = `
        You are an AI assistant that extracts company information from text and formats it into a valid JSON object.
        SOURCE TEXT: "${contentToProcess.substring(0, 10000)}..."
        
        Please generate a JSON object matching this schema:
        {
            "name": "string",
            "industry": "string",
            "location": "string (city/prefecture)",
            "description": "string (short summary, max 100 chars)",
            "foundingYear": number (or null),
            "capital": "string (e.g. 1000万円) or null",
            "employeeCount": "string (e.g. 50名) or null",
            "representative": "string (CEO name) or null",
            "address": "string (full address) or null",
            "phone": "string or null",
            "website": "string or null",
            "businessDetails": "string (detailed business activities)",
            "philosophy": "string (mission/vision) or null",
            "benefits": "string (welfare/benefits summary) or null",
            "rjpNegatives": "string (realistic job preview: potential negative aspects/challenges)",
            "rjpPositives": "string (realistic job preview: rewarding aspects)"
        }

        If specific values are not found in the source text, use reasonable inferences based on the company type or return null.
        For RJP (Realistic Job Preview), generate honest comments about potential hardships based on the industry if not explicit in the text.
        Return ONLY valid JSON.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            if (data.error.code === 429 || data.error.message.includes('Quota')) {
                throw new Error('AI service quota exceeded. Please try again later.');
            }
            throw new Error(data.error.message);
        }

        const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResult) throw new Error('No content generated');

        // Clean markdown code blocks if present
        const jsonStr = textResult.replace(/```json\n?|\n?```/g, '').trim();

        try {
            const profile = JSON.parse(jsonStr);
            return NextResponse.json(profile);
        } catch (e) {
            console.error('JSON Parse Error:', e, jsonStr);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        const status = error.message.includes('quota') || error.message.includes('Quota') ? 429 : 500;
        return NextResponse.json({ error: error.message || 'Failed to generate profile' }, { status: status });
    }
}
