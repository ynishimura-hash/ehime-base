
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Init Supabase with Service Role Key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing in API route');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/elearning/content - Get all lessons with pagination
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const curriculumId = searchParams.get('curriculumId');

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('course_lessons')
            .select(`
                *,
                curriculum: course_curriculums(title)
            `, { count: 'exact' });

        // Apply filters
        if (curriculumId) {
            if (curriculumId === 'unassigned') {
                query = query.is('curriculum_id', null);
            } else {
                query = query.eq('curriculum_id', curriculumId);
            }
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('API: Error fetching content:', error);
            throw error;
        }

        // Map to frontend format
        const mappedData = (data || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.youtube_url ? 'video' : 'document',
            url: l.youtube_url,
            duration: l.duration,
            category: l.curriculum?.title || 'Uncategorized',
            createdAt: l.created_at,
            quiz: l.quiz,
            material_url: l.material_url,
            thumbnail: l.thumbnail_url
        }));

        return NextResponse.json({ data: mappedData, count: count || 0 });

    } catch (error: any) {
        console.error('API Error getAllContent:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

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
