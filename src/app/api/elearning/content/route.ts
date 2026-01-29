
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing in API route');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, url, duration, quiz, material_url, category } = body;

        // Basic validation
        if (!title || !category) {
            return NextResponse.json({ error: 'Missing required fields: title or category' }, { status: 400 });
        }

        // 1. Lookup Curriculum ID by Category Name
        const { data: curr, error: currError } = await supabase
            .from('course_curriculums')
            .select('id')
            .eq('title', category)
            .single();

        if (currError || !curr) {
            console.error('Error finding curriculum:', currError);
            return NextResponse.json({ error: `Category '${category}' not found.` }, { status: 404 });
        }

        // 2. Insert new Lesson
        const { data, error } = await supabase
            .from('course_lessons')
            .insert({
                curriculum_id: curr.id,
                title,
                youtube_url: url,
                duration,
                quiz,
                material_url,
                order_index: 999 // Default to end, can be refined later
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting lesson:', error);
            throw error;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('API Error createContent:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
