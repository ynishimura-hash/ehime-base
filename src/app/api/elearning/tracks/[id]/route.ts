import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/elearning/tracks/[id] - Get a single track
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                included_courses: course_curriculums(id, title)
            `)
            .eq('id', id)
            .eq('category', 'Track')
            .single();

        if (error) {
            console.error('API: Error fetching track:', error);
            return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }

        // Map to frontend format
        const track = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            image: data.image || '',
            is_published: data.is_published,
            courseIds: data.included_courses?.map((c: any) => c.id) || [],
            courses: data.included_courses || []
        };

        return NextResponse.json(track);

    } catch (error) {
        console.error('API track error:', error);
        return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
    }
}

// PUT /api/elearning/tracks/[id] - Update a track
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        console.log('API Track Update Body:', body);

        // Filter allowed fields
        const updates: any = {};
        if (body.title !== undefined) updates.title = body.title;
        if (body.description !== undefined) updates.description = body.description;
        if (body.image !== undefined) updates.image = body.image;
        if (body.is_published !== undefined) updates.is_published = body.is_published;

        console.log('API Track Updates Applied:', updates);

        const { error } = await supabase
            .from('courses')
            .update(updates)
            .eq('id', id)
            .eq('category', 'Track');

        if (error) {
            console.error('API: Error updating track:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API update track error:', error);
        return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
    }
}

// DELETE /api/elearning/tracks/[id] - Delete a track
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Note: constraint violations might occur if courses are linked. 
        // Ideally we should unlink them first, but for now generic delete.
        // Users/Admins should be aware that deleting a track might fail if restrictions exist,
        // or it might cascade (depending on DB setup).
        // Let's first try simple delete.

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id)
            .eq('category', 'Track');

        if (error) {
            console.error('API: Error deleting track:', error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('API delete track error:', error);
        return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
    }
}
