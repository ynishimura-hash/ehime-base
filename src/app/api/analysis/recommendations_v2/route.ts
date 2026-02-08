
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VALUE_CARDS } from '@/lib/constants/analysisData';
import { getGeminiModel, genAI } from '@/lib/ai-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('user_course_recommendations')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    console.log('[API V2] Generating Recommendations...');
    try {
        const { userId, selectedValues } = await request.json();

        if (!userId || !selectedValues || !Array.isArray(selectedValues)) {
            return NextResponse.json({ error: 'userId and selectedValues array are required' }, { status: 400 });
        }

        // 1. Fetch available modules (course_curriculums) - これがコース一覧で使われているデータ
        const { data: courses, error: courseError } = await supabase
            .from('course_curriculums')
            .select('id, title, category, description')
            .eq('is_public', true);

        if (courseError) {
            console.error('Error fetching course_curriculums:', courseError);
            return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
        }

        if (!courses || courses.length === 0) {
            console.warn('[API V2] No course_curriculums found');
            return NextResponse.json({ error: 'No courses available to recommend' }, { status: 404 });
        }

        console.log('[API V2] Found modules:', courses.length, courses.map(c => ({ id: c.id, title: c.title })));

        // 2. Fetch existing recommendations (for dedup within same request, not across requests)
        // Note: After DELETE, this should be empty
        const { data: existing } = await supabase
            .from('user_course_recommendations')
            .select('value_id, course_id')
            .eq('user_id', userId);

        const existingPairs = new Set((existing || []).map(r => `${r.value_id}_${r.course_id}`));
        console.log('[API V2] Existing recommendations count:', existing?.length || 0);

        // 3. Prepare Candidates (Strict Unique Selection)
        const candidates: any[] = [];
        let candidateIdCounter = 0;
        const usedCourseIds = new Set<string>();

        // Filter to only positive values (exclude negative trait IDs)
        const positiveValueIds = selectedValues.filter((id: number) => {
            const card = VALUE_CARDS.find(v => v.id === id);
            return card && card.isPositive;
        });

        // Process up to 5 positive values
        const targetValues = positiveValueIds.slice(0, 5);
        console.log('[API V2] Selected values (all):', selectedValues);
        console.log('[API V2] Positive values:', positiveValueIds);
        console.log('[API V2] Target values (top 5 positive):', targetValues);
        console.log('[API V2] Available courses count:', courses.length);

        for (const valueId of targetValues) {
            // Skip only if this specific value already has recommendations
            const valueAlreadyHasRecs = (existing || []).some(r => r.value_id === valueId);
            if (valueAlreadyHasRecs) {
                console.log(`[API V2] Skipping value ${valueId} - already has recommendations`);
                continue;
            }

            const valueCard = VALUE_CARDS.find(v => v.id === valueId);
            if (!valueCard) {
                console.log(`[API V2] Value card not found for ID: ${valueId}`);
                continue;
            }

            // Track courses used within THIS value (allow sharing across different values)
            const usedForThisValue = new Set<string>();
            let addedCount = 0;

            // Try to assign 2 courses to this value
            for (let i = 0; i < courses.length && addedCount < 2; i++) {
                // Distribute courses based on value ID to give variety
                const courseIndex = (valueId * 3 + i) % courses.length;
                const course = courses[courseIndex];

                if (course && !usedForThisValue.has(course.id)) {
                    // Prefer unused courses, but allow reuse if necessary
                    const isPreferred = !usedCourseIds.has(course.id);

                    if (isPreferred || addedCount === 0 || i >= courses.length - 1) {
                        usedForThisValue.add(course.id);
                        usedCourseIds.add(course.id);
                        candidates.push({
                            tempId: candidateIdCounter++,
                            valueId: valueId,
                            valueName: valueCard.name,
                            courseId: course.id,
                            courseTitle: course.title,
                            courseDesc: course.description || ''
                        });
                        addedCount++;
                        console.log(`[API V2] Added course "${course.title}" for value "${valueCard.name}"`);
                    }
                }
            }

            // If still not enough, just pick any remaining courses
            if (addedCount < 2) {
                for (const course of courses) {
                    if (!usedForThisValue.has(course.id) && addedCount < 2) {
                        usedForThisValue.add(course.id);
                        candidates.push({
                            tempId: candidateIdCounter++,
                            valueId: valueId,
                            valueName: valueCard.name,
                            courseId: course.id,
                            courseTitle: course.title,
                            courseDesc: course.description || ''
                        });
                        addedCount++;
                        console.log(`[API V2] Fallback: Added course "${course.title}" for value "${valueCard.name}"`);
                    }
                }
            }
        }

        console.log('[API V2] Total candidates:', candidates.length);

        if (candidates.length === 0) {
            const { data: allRecs } = await supabase
                .from('user_course_recommendations')
                .select('*')
                .eq('user_id', userId);
            return NextResponse.json(allRecs || []);
        }

        // 4. Generate AI Messages
        let aiResults: Record<number, string> = {};

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    responseMimeType: "application/json"
                }
            });

            const prompt = `
あなたはキャリア心理学の専門家です。ユーザーの価値観と推奨コースの組み合わせに対して、なぜこのコースがこの価値観を持つ人に適しているのかを具体的に説明するメッセージを生成してください。

【重要なルール】
- 各メッセージは80〜100文字程度で作成すること
- 価値観とコース内容の具体的な関連性を説明すること
- 「〜しましょう」「〜です」などの一般的な表現ではなく、深い洞察を含めること
- ユーザーの強みがこのコースでどう活かせるか、どんな成長が期待できるかを具体的に述べること

【入力データ】
${JSON.stringify(candidates.map(c => ({
                id: c.tempId,
                value: c.valueName,
                course: c.courseTitle,
                description: c.courseDesc.substring(0, 100)
            })), null, 2)}

【出力形式】JSON配列
[ { "id": number, "message": "string（80〜100文字）" } ]
            `;

            console.log('[API V2] Invoking Gemini AI (2.5-flash-lite)...');
            console.log('[API V2] Candidates count:', candidates.length);

            let responseText = '';
            let retries = 3;
            while (retries > 0) {
                try {
                    const result = await model.generateContent(prompt);
                    responseText = result.response.text();
                    console.log('[API V2] AI Response received, length:', responseText.length);
                    console.log('[API V2] AI Response preview:', responseText.substring(0, 500));
                    break; // Success
                } catch (err: any) {
                    retries--;
                    console.warn(`[API V2] AI Generation Failed (Retries left: ${retries}):`, err.message);
                    if (retries === 0) throw err;
                    // Wait 1s, 2s, 3s...
                    await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
                }
            }

            try {
                // More robust JSON extraction
                const jsonStart = responseText.indexOf('[');
                const jsonEnd = responseText.lastIndexOf(']');

                let cleanJson = responseText;
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    cleanJson = responseText.substring(jsonStart, jsonEnd + 1);
                } else {
                    // Fallback cleanup
                    cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                }

                console.log('[API V2] Cleaned JSON:', cleanJson.substring(0, 300));
                const parsed = JSON.parse(cleanJson);
                console.log('[API V2] Parsed array length:', Array.isArray(parsed) ? parsed.length : 'not array');

                if (Array.isArray(parsed)) {
                    parsed.forEach((item: any) => {
                        console.log('[API V2] Parsing item:', item.id, item.message?.substring(0, 50));
                        if (typeof item.id === 'number' && item.message) {
                            aiResults[item.id] = item.message;
                        }
                    });
                    console.log('[API V2] aiResults keys:', Object.keys(aiResults));
                } else {
                    console.warn('[API V2] Parsed result is not an array');
                }
            } catch (e: any) {
                console.error('[API V2] AI JSON Parse Error:', e.message);
                console.error('[API V2] Failed to parse response:', responseText.substring(0, 200));
            }
        } catch (aiError: any) {
            console.error('[API V2] AI Generation Failed:', aiError.message);
        }

        // 5. Build Final Records
        const newRecommendations = candidates.map(c => ({
            user_id: userId,
            course_id: c.courseId,
            value_id: c.valueId,
            reason_message: aiResults[c.tempId] || generateFallbackMessage(c.valueName, c.courseTitle)
        }));

        if (newRecommendations.length > 0) {
            const { error: insertError } = await supabase
                .from('user_course_recommendations')
                .insert(newRecommendations);
            if (insertError) throw insertError;
        }

        // 6. Return all results
        const { data: allRecs, error: fetchError } = await supabase
            .from('user_course_recommendations')
            .select('*')
            .eq('user_id', userId);

        if (fetchError) throw fetchError;
        return NextResponse.json(allRecs);

    } catch (error) {
        console.error('[API V2] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function generateFallbackMessage(valueName: string, courseTitle: string) {
    return `あなたの「${valueName}」という強みは、この分野で大きく開花するでしょう。特に${courseTitle}においては、その能力を存分に発揮できるはずです。`;
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    await supabase.from('user_course_recommendations').delete().eq('user_id', userId);
    return NextResponse.json({ success: true });
}
