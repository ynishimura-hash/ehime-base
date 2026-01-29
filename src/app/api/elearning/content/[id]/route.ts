
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET handler? Maybe not needed if we only use this for updates, 
// but Next.js dynamic routes can handle all methods.

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
