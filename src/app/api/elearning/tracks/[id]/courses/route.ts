import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTotalDuration } from '@/utils/duration';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/elearning/tracks/[id]/courses - Get courses for a specific track
export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Track ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('course_curriculums')
            .select(`
                *,
                lessons: course_lessons(*)
            `)
            .eq('course_id', id)
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error('API: Error fetching courses for track:', error);
            throw error;
        }

        // Map to frontend format
        const courses = (data || []).map(curr => ({
            id: curr.id,
            title: curr.title,
            image: curr.image || '', // Add 'image' for frontend compatibility
            description: curr.description || '',
            thumbnail_url: curr.image || '', // Map 'image' column to 'thumbnail_url'
            viewCount: curr.view_count, // Map view_count
            tags: curr.tags, // Map tags
            courseCount: curr.lessons?.length || 0,
            // Calculate Total Duration
            totalDuration: calculateTotalDuration(curr.lessons || []),
            lessons: (curr.lessons || [])
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    type: l.youtube_url ? 'video' : 'document',
                    url: l.youtube_url,
                    duration: l.duration,
                    category: curr.title,
                    createdAt: l.created_at,
                    quiz: l.quiz
                }))
        }));

        return NextResponse.json(courses);

    } catch (error) {
        console.error('API courses error:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}
