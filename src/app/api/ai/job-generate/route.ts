import { NextResponse } from 'next/server';

const MODEL_NAME = 'gemini-2.0-flash-001';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const body = await req.json();
        const { input, base64Data, mimeType } = body;

        // Validation: Either input (URL/Text) or base64Data (File) is required
        if (!input && !base64Data) {
            return NextResponse.json({ error: 'Input text/URL or File is required' }, { status: 400 });
        }

        let contentToProcess = input || '';
        let geminiParts: any[] = [];

        // CASE 1: File Upload (PDF/Image)
        if (base64Data && mimeType) {
            geminiParts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                }
            });
            console.log(`Processed uploaded file: ${mimeType}, Length: ${base64Data.length}`);
        }
        // CASE 2: URL Input
        else if (input && (input.startsWith('http://') || input.startsWith('https://'))) {
            try {
                console.log('Fetching Job URL:', input);
                const siteRes = await fetch(input, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                if (!siteRes.ok) throw new Error(`Failed to fetch site: ${siteRes.statusText}`);

                const contentType = siteRes.headers.get('content-type');

                if (contentType && contentType.includes('application/pdf')) {
                    const arrayBuffer = await siteRes.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    geminiParts.push({
                        inline_data: {
                            mime_type: 'application/pdf',
                            data: base64
                        }
                    });
                } else {
                    const html = await siteRes.text();
                    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                        .replace(/<header\b[^>]*>([\s\S]*?)<\/header>/gm, "")
                        .replace(/<footer\b[^>]*>([\s\S]*?)<\/footer>/gm, "")
                        .replace(/<nav\b[^>]*>([\s\S]*?)<\/nav>/gm, "");
                    text = text.replace(/<[^>]+>/g, "\n");
                    contentToProcess = text.replace(/\s+/g, " ").trim().substring(0, 20000);
                }
            } catch (fetchError: any) {
                console.error('URL Fetch Error:', fetchError);
                return NextResponse.json({ error: `URL fetch failed: ${fetchError.message}` }, { status: 400 });
            }
        }

        const prompt = `
        You are an HR specialist. Extract job posting details from the provided document (PDF or text) and format it into a valid JSON object.
        ${!base64Data && geminiParts.length === 0 ? `SOURCE TEXT: "${contentToProcess.substring(0, 15000)}..."` : ''}

        Please generate a JSON object matching this schema:
        {
            "title": "string (attractive job title)",
            "category": "string (choose from: 新卒, 中途, アルバイト, 体験JOB, インターンシップ)",
            "description": "string (job summary and responsibilities)",
            "requirements": "string (skills and experience required)",
            "workingHours": "string",
            "holidays": "string",
            "welfare": "string (benefits)",
            "selectionProcess": "string",
            "reward": "string (salary range)"
        }

        If specific values are not found, infer reasonable professional defaults based on the context.
        Return ONLY valid JSON.
        `;

        geminiParts.push({ text: prompt });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: geminiParts }]
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

        const jsonStr = textResult.replace(/```json\n?|\n?```/g, '').trim();

        try {
            const result = JSON.parse(jsonStr);
            return NextResponse.json(result);
        } catch (e) {
            console.error('JSON Parse Error:', e, jsonStr);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        const status = error.message.includes('quota') || error.message.includes('Quota') ? 429 : 500;
        return NextResponse.json({ error: error.message || 'Failed to generate job' }, { status: status });
    }
}
