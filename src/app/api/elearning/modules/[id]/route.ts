import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイドでService Role Keyを使用してクライアントロック問題を回避
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log(`API: Fetching module ${id} with lessons...`);

        // モジュールとレッスンを取得
        const { data, error } = await supabase
            .from('course_curriculums')
            .select(`
                *,
                lessons: course_lessons(*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('API: Error fetching module:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        console.log(`API: Found module ${data.title} with ${data.lessons?.length || 0} lessons`);

        // Extract image from tags if available
        let imageUrl = data.image || data.thumbnail_url || '';
        if (!imageUrl && data.tags && Array.isArray(data.tags)) {
            const imageTag = data.tags.find((t: string) => t.startsWith('image:'));
            if (imageTag) {
                imageUrl = imageTag.replace('image:', '');
            }
        }

        // フロントエンド用にマッピング
        const module = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            image: imageUrl,
            thumbnail_url: imageUrl,
            courseCount: data.lessons?.length || 0,
            tags: data.tags || [],
            viewCount: data.view_count || 0,
            lessons: (data.lessons || [])
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((l: any) => ({
                    id: l.id,
                    title: l.title,
                    type: l.youtube_url ? 'video' : 'document',
                    url: l.youtube_url,
                    duration: l.duration,
                    category: data.title,
                    createdAt: l.created_at,
                    quiz: l.quiz,
                    material_url: l.material_url,
                    hasQuiz: l.has_quiz,
                    hasDocument: l.has_document
                }))
        };

        return NextResponse.json(module);

    } catch (error) {
        console.error('API module error:', error);
        return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
    }
}
