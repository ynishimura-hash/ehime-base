import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VALUE_CARDS } from '@/lib/constants/analysisData';
import { getGeminiModel } from '@/lib/ai-client';

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
    try {
        const { userId, selectedValues } = await request.json();

        if (!userId || !selectedValues || !Array.isArray(selectedValues)) {
            return NextResponse.json({ error: 'userId and selectedValues array are required' }, { status: 400 });
        }

        // 1. Fetch available courses
        const { data: courses, error: coursesError } = await supabase.from('courses').select('id, title, description');
        if (coursesError) throw coursesError;
        if (!courses || courses.length === 0) {
            return NextResponse.json({ error: 'No courses available to recommend' }, { status: 404 });
        }

        // 2. Fetch existing recommendations
        const { data: existing } = await supabase
            .from('user_course_recommendations')
            .select('value_id')
            .eq('user_id', userId);

        const existingValueIds = new Set(existing?.map(r => r.value_id) || []);

        // 3. Prepare Candidates
        const candidates: any[] = [];
        let candidateIdCounter = 0;

        for (const valueId of selectedValues) {
            if (existingValueIds.has(valueId)) continue;

            const valueCard = VALUE_CARDS.find(v => v.id === valueId);
            if (!valueCard) continue;

            // Pick 2 courses per value deterministically based on ID to ensure variety
            for (let i = 0; i < 2; i++) {
                const courseIndex = (valueId + i * 3) % courses.length; // Spread out selection
                const course = courses[courseIndex];

                candidates.push({
                    tempId: candidateIdCounter++,
                    valueId: valueId,
                    valueName: valueCard.name,
                    courseId: course.id,
                    courseTitle: course.title,
                    courseDesc: course.description || ''
                });
            }
        }

        if (candidates.length === 0) {
            // Just return existing if nothing new to add
            const { data: allRecs, error: fetchError } = await supabase
                .from('user_course_recommendations')
                .select('*')
                .eq('user_id', userId);
            return NextResponse.json(allRecs || []);
        }

        // 4. Generate AI Messages (Batch)
        let aiResults: Record<number, string> = {};
        try {
            const model = getGeminiModel();

            const prompt = `
                Role: Expert Career Coach AI.
                Task: Generate a specific, actionable, and insightful recommendation message (around 140 Japanese characters) for each User Value + Recommended Course pair.
                
                Goal: Explain clearly HOW the user can leverage their specific strength (provided in 'value') to master this course or apply the skills in a real-world scenario.
                Focus: Concrete application, synergy, and future potential. Avoid generic praise.
                Tone: Professional, Insightful ("示唆に富む"), Action-oriented.
                Language: Japanese.
                
                Examples:
                - "あなたの「慎重さ」は、システム開発においてバグを未然に防ぐ強力な武器になります。このコースでテスト技法を学び、堅牢なコードを書くスキルを磨けば、チーム内で唯一無二の信頼を得られるエンジニアへと成長できるでしょう。"
                
                Output Format: JSON Array of objects with "id" (number) and "message" (string). Do not output markdown code blocks, just the JSON.
                
                Input Pairs:
                ${JSON.stringify(candidates.map(c => ({
                id: c.tempId,
                value: c.valueName,
                course: c.courseTitle,
                course_context: c.courseDesc.substring(0, 100)
            })))}
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(responseText);
                if (Array.isArray(parsed)) {
                    parsed.forEach((item: any) => {
                        if (typeof item.id === 'number' && item.message) {
                            aiResults[item.id] = item.message;
                        }
                    });
                }
            } catch (jsonError) {
                console.error('Failed to parse AI response JSON:', jsonError);
                // Fallback will catch this
            }

        } catch (aiError) {
            console.error('AI Generation failed (using fallback):', aiError);
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
        console.error('Error generating recommendations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function generateFallbackMessage(valueName: string, courseTitle: string) {
    const templates = [
        `「${valueName}」の資質を持つあなたには、このコースが新たな可能性を拓きます。`,
        `あなたの「${valueName}」という強みは、この分野で大きく開花するでしょう。`,
        `「${valueName}」を活かし、${courseTitle}で実践力を高めましょう。`,
        `周囲から「${valueName}」と評価されるポテンシャルを、ここで引き出せます。`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('user_course_recommendations')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting recommendations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
