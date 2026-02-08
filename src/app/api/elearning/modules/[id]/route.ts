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
            // PGRST116: JSON object requested, multiple (or no) rows returned
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Module not found' }, { status: 404 });
            }
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
            category: data.category || '未分類',
            courseCount: data.lessons?.length || 0,
            tags: data.tags || [],
            viewCount: data.view_count || 0,
            is_public: data.is_public,
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

// PUT /api/elearning/modules/[id] - Update a module
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        console.log('API Module Update Body:', body);

        // Filter allowed fields
        const updates: any = {};
        if (body.title !== undefined) updates.title = body.title;
        if (body.description !== undefined) updates.description = body.description;
        if (body.image !== undefined) updates.image = body.image;
        if (body.is_public !== undefined) updates.is_public = body.is_public;
        if (body.category !== undefined) updates.category = body.category;
        // course_id can be null (for unlinking from track)
        if ('course_id' in body) updates.course_id = body.course_id;

        console.log('API Module Updates Applied:', updates);

        const { error } = await supabase
            .from('course_curriculums')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('API: Error updating module:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API update module error:', error);
        return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
    }
}

// DELETE /api/elearning/modules/[id] - Delete a module
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { error } = await supabase
            .from('course_curriculums')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('API: Error deleting module:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API delete module error:', error);
        return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 });
    }
}
