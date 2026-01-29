import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VALUE_CARDS } from '@/lib/constants/analysisData';

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

        // 2. Fetch existing recommendations to avoid duplicates if possible, or just refresh
        const { data: existing } = await supabase
            .from('user_course_recommendations')
            .select('value_id')
            .eq('user_id', userId);

        const existingValueIds = new Set(existing?.map(r => r.value_id) || []);

        const newRecommendations = [];

        for (const valueId of selectedValues) {
            if (existingValueIds.has(valueId)) continue;

            const valueCard = VALUE_CARDS.find(v => v.id === valueId);
            if (!valueCard) continue;

            // Simple logic: Pick 2 courses per value (deterministically for now)
            // In a real AI implementation, this is where we'd call LLM
            for (let i = 0; i < 2; i++) {
                const courseIndex = (valueId + i) % courses.length;
                const course = courses[courseIndex];

                // Mock AI message generation
                const reasonMessage = generateMockMessage(valueCard.name, course.title);

                newRecommendations.push({
                    user_id: userId,
                    course_id: course.id,
                    value_id: valueId,
                    reason_message: reasonMessage
                });
            }
        }

        if (newRecommendations.length > 0) {
            const { error: insertError } = await supabase
                .from('user_course_recommendations')
                .insert(newRecommendations);
            if (insertError) throw insertError;
        }

        // Return all current recommendations
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

function generateMockMessage(valueName: string, courseTitle: string) {
    const templates = [
        "「{value}」の資質を持つあなたには、この{course}を通して、更なる専門性を磨くことが推奨されます。",
        "あなたの「{value}」という強みは、この{course}で学べるスキルと非常に相性が良く、高い相乗効果が期待できます。",
        "「{value}」を活かしてキャリアを切り拓くために、この{course}で基礎を固めることが成功への近道です。",
        "周囲から「{value}」と評価されるあなたのポテンシャルを、この{course}が最大限に引き出します。"
    ];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace("{value}", valueName).replace("{course}", courseTitle);
}
