// デバッグ用API - 一時的
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VALUE_CARDS } from '@/lib/constants/analysisData';
import { getGeminiModel, genAI } from '@/lib/ai-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'test';
    const action = searchParams.get('action') || 'check';

    const logs: string[] = [];
    logs.push(`[DEBUG] Starting action: ${action}`);

    try {
        if (action === 'check') {
            // 1. 現在のレコメンドを確認
            const { data: recs, error } = await supabase
                .from('user_course_recommendations')
                .select('*')
                .eq('user_id', userId);

            logs.push(`[DEBUG] Current recommendations: ${recs?.length || 0}`);

            return NextResponse.json({
                logs,
                recommendations: recs,
                count: recs?.length || 0
            });
        }

        if (action === 'test_ai') {
            // 2. AI生成テスト
            logs.push('[DEBUG] Testing AI generation...');

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            const testPrompt = `
あなたはキャリアカウンセラーです。以下の価値観をもつ人に、デジタルスキルを学ぶメリットを100文字程度で説明してください。

価値観: 好奇心旺盛
コース: デジタル基礎

【出力形式】JSON配列
[ { "id": 0, "message": "文章" } ]
            `;

            try {
                const result = await model.generateContent(testPrompt);
                const responseText = result.response.text();
                logs.push(`[DEBUG] AI Response length: ${responseText.length}`);
                logs.push(`[DEBUG] AI Response: ${responseText.substring(0, 300)}`);

                // JSON解析テスト
                const jsonStart = responseText.indexOf('[');
                const jsonEnd = responseText.lastIndexOf(']');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const cleanJson = responseText.substring(jsonStart, jsonEnd + 1);
                    const parsed = JSON.parse(cleanJson);
                    logs.push(`[DEBUG] Parsed successfully: ${JSON.stringify(parsed)}`);
                }

                return NextResponse.json({ logs, success: true, aiResponse: responseText });
            } catch (err: any) {
                logs.push(`[DEBUG] AI Error: ${err.message}`);
                return NextResponse.json({ logs, success: false, error: err.message });
            }
        }

        if (action === 'check_courses') {
            // 3. コース確認
            const { data: courses, error } = await supabase
                .from('courses')
                .select('id, title, category, is_published')
                .eq('is_published', true)
                .neq('category', 'Track');

            logs.push(`[DEBUG] Published courses (non-Track): ${courses?.length || 0}`);

            return NextResponse.json({
                logs,
                courses: courses?.map(c => ({ id: c.id, title: c.title, category: c.category })),
                count: courses?.length || 0
            });
        }

        if (action === 'check_values') {
            // 4. 価値観確認
            const sampleValues = VALUE_CARDS.slice(0, 10).map(v => ({ id: v.id, name: v.name }));
            logs.push(`[DEBUG] Sample values: ${JSON.stringify(sampleValues)}`);

            return NextResponse.json({ logs, values: sampleValues });
        }

        return NextResponse.json({ logs, message: 'Unknown action' });

    } catch (error: any) {
        logs.push(`[DEBUG] Error: ${error.message}`);
        return NextResponse.json({ logs, error: error.message }, { status: 500 });
    }
}
