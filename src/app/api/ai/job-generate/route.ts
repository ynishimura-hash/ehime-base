import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const body = await req.json();
        const { input, base64Data, mimeType } = body;

        // Validation
        if (!input && !base64Data) {
            return NextResponse.json({ error: 'Input text/URL or File is required' }, { status: 400 });
        }

        let parts: any[] = [];
        let contentToProcess = input || '';

        // CASE 1: File Upload (PDF/Image)
        if (base64Data && mimeType) {
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            });
            console.log(`Processed uploaded file: ${mimeType}`);
        }
        // CASE 2: URL Input (Fetch content first)
        else if (input && (input.startsWith('http://') || input.startsWith('https://'))) {
            try {
                console.log('Fetching Job URL:', input);
                const siteRes = await fetch(input, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0' }
                });

                if (!siteRes.ok) throw new Error(`Failed to fetch site: ${siteRes.statusText}`);
                const contentType = siteRes.headers.get('content-type');

                if (contentType && contentType.includes('application/pdf')) {
                    const arrayBuffer = await siteRes.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    parts.push({
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: base64
                        }
                    });
                } else {
                    const html = await siteRes.text();
                    // Simple cleanup
                    let text = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                        .replace(/<[^>]+>/g, "\n");
                    contentToProcess = text.replace(/\s+/g, " ").trim().substring(0, 20000);
                    parts.push({ text: `Source Context: ${contentToProcess}` });
                }
            } catch (fetchError: any) {
                console.error('URL Fetch Error:', fetchError);
                return NextResponse.json({ error: `URL fetch failed: ${fetchError.message}` }, { status: 400 });
            }
        } else if (input) {
            parts.push({ text: `Source Context: ${input}` });
        }

        const prompt = `
        You are an HR specialist. Extract job posting details from the provided document (PDF or text) and format it into a valid JSON object.
        
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

        parts.push({ text: prompt });

        const result = await model.generateContent(parts);
        const response = await result.response;
        const textResult = response.text();

        const jsonStr = textResult.replace(/```json\n?|\n?```/g, '').trim();
        const jsonResult = JSON.parse(jsonStr);

        return NextResponse.json(jsonResult);

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate job' }, { status: 500 });
    }
}
