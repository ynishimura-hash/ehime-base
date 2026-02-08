import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/elearning/courses/[id] - Get a single course with its curriculums and lessons
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // IDを小文字に正規化
        const normalizedId = id.toLowerCase();
        console.log(`API: Fetching course ${normalizedId} with curriculums and lessons...`);

        // コースを取得（curriculumsとlessonsを含む）
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                curriculums: course_curriculums(
                    *,
                    lessons: course_lessons(*)
                )
            `)
            .eq('id', normalizedId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.log(`API: Course ${normalizedId} not found`);
                return NextResponse.json({ error: 'Course not found' }, { status: 404 });
            }
            console.error('API: Error fetching course:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // フロントエンド用にデータを整形
        // curriculumsからすべてのlessonsを抽出してフラット化
        const allLessons: any[] = [];
        const curriculums = (data.curriculums || [])
            .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((curr: any) => {
                const lessons = (curr.lessons || [])
                    .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                    .map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        type: l.youtube_url ? 'video' : 'document',
                        url: l.youtube_url,
                        youtube_url: l.youtube_url,
                        duration: l.duration,
                        thumbnail_url: l.thumbnail_url,
                        category: curr.title,
                        curriculumId: curr.id,
                        hasQuiz: l.has_quiz,
                        hasDocument: l.has_document
                    }));

                allLessons.push(...lessons);

                return {
                    id: curr.id,
                    title: curr.title,
                    description: curr.description,
                    lessons
                };
            });

        const course = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            image: data.image,
            category: data.category || 'Reskilling',
            level: data.level,
            instructor: data.instructor,
            duration: data.duration,
            is_published: data.is_published,
            view_count: data.view_count || 0,
            curriculums,
            // すべてのレッスンをフラットにしたものも提供
            lessons: allLessons
        };

        console.log(`API: Found course "${data.title}" with ${curriculums.length} curriculums and ${allLessons.length} total lessons`);

        return NextResponse.json(course);

    } catch (error) {
        console.error('API course error:', error);
        return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
    }
}
