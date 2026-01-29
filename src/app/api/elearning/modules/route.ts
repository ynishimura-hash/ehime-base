import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateTotalDuration } from '@/utils/duration';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/elearning/modules - Get all modules (course_curriculums) with lesson counts
export async function GET() {
    try {
        console.log('API: Fetching modules with lesson counts...');

        // レッスン数を取得するためにJOINを使用（サーバーサイドなのでロック問題なし）
        // duration も取得して合計時間を計算する
        const { data, error } = await supabase
            .from('course_curriculums')
            .select(`
                *,
                lessons: course_lessons(id, duration)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('API: Error fetching modules:', error);
            throw error;
        }

        console.log(`API: Found ${data?.length || 0} modules`);

        // Map to frontend format with lesson count
        const modules = (data || []).map((curr: any) => {
            // Extract image from tags if available (fallback for missing image column)
            let imageUrl = curr.image || curr.thumbnail_url || '';
            if (!imageUrl && curr.tags && Array.isArray(curr.tags)) {
                const imageTag = curr.tags.find((t: string) => t.startsWith('image:'));
                if (imageTag) {
                    imageUrl = imageTag.replace('image:', '');
                }
            }

            return {
                id: curr.id,
                title: curr.title,
                description: curr.description || '',
                image: imageUrl,
                thumbnail_url: imageUrl,
                courseCount: curr.lessons?.length || 0,
                // Calculate Total Duration
                totalDuration: calculateTotalDuration(curr.lessons || []),
                lessons: [],
                tags: curr.tags || [],
                viewCount: curr.view_count || 0
            };
        });

        return NextResponse.json(modules);

    } catch (error) {
        console.error('API modules error:', error);
        return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 });
    }
}
