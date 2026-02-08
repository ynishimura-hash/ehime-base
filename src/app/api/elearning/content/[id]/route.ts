
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/elearning/content/[id] - Get single lesson details with its parent course info
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        console.log(`API: Fetching single lesson ${id}...`);

        // Fetch lesson and join its parent curriculum
        const { data, error } = await supabase
            .from('course_lessons')
            .select(`
                *,
                curriculum: course_curriculums (
                    id,
                    title,
                    description,
                    course_id,
                    lessons: course_lessons (id, title, duration, order_index)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('API Error fetching lesson:', error);
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Map parent curriculum as 'course' for frontend compatibility
        const mappedData = {
            ...data,
            course: data.curriculum ? {
                id: data.curriculum.id,
                title: data.curriculum.title,
                description: data.curriculum.description,
                lessons: (data.curriculum.lessons || [])
                    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            } : null
        };

        return NextResponse.json(mappedData);

    } catch (error: any) {
        console.error('API Error getLesson:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Map frontend fields to DB fields
        const dbUpdates: any = {};

        // Only include defined fields to allow partial updates
        if (body.title !== undefined) dbUpdates.title = body.title;
        if (body.url !== undefined) dbUpdates.youtube_url = body.url;
        if (body.duration !== undefined) dbUpdates.duration = body.duration;
        if (body.quiz !== undefined) dbUpdates.quiz = body.quiz;
        if (body.material_url !== undefined) dbUpdates.material_url = body.material_url;
        if (body.hasQuiz !== undefined) dbUpdates.has_quiz = body.hasQuiz;
        if (body.hasDocument !== undefined) dbUpdates.has_document = body.hasDocument;

        console.log(`API Updating Content [${id}]:`, dbUpdates);

        const { error } = await supabase
            .from('course_lessons')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Supabase Update Error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Error updateContent:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        console.log(`API Deleting Content [${id}]`);

        const { error } = await supabase
            .from('course_lessons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase Delete Error:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Error deleteContent:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
