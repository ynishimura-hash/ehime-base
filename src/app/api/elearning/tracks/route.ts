import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/elearning/tracks - Get all learning tracks
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const showAll = searchParams.get('showAll') === 'true';

        let query = supabase
            .from('courses')
            .select(`
                *,
                included_courses: course_curriculums(id, title)
            `)
            .eq('category', 'Track');

        // Only filter by is_published if not showing all (default behavior)
        if (!showAll) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query
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
            is_published: d.is_published,
            courseIds: d.included_courses?.map((c: any) => c.id) || [],
            courses: d.included_courses || [] // Populate for UI
        }));

        return NextResponse.json(tracks);

    } catch (error) {
        console.error('API tracks error:', error);
        return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
    }
}
