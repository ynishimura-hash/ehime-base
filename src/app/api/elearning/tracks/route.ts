import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/elearning/tracks - Get all learning tracks
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                included_courses: course_curriculums(id, title)
            `)
            .eq('category', 'Track')
            .eq('is_published', true)
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error('API: Error fetching tracks:', error);
            throw error;
        }

        // Map to frontend format
        const tracks = (data || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description || '',
            image: d.image || '',
            courseIds: d.included_courses?.map((c: any) => c.id) || [],
            courses: d.included_courses || [] // Populate for UI
        }));

        return NextResponse.json(tracks);

    } catch (error) {
        console.error('API tracks error:', error);
        return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }
}
