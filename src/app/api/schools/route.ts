import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const type = searchParams.get('type') || '';

        const supabase = await createClient();
        let queryBuilder = supabase.from('schools').select('*');

        if (query) {
            queryBuilder = queryBuilder.ilike('name', `%${query}%`);
        }

        if (type) {
            queryBuilder = queryBuilder.eq('type', type);
        }

        // Limit to 20 for better UX, but 5 is also fine if UI is small
        const { data, error } = await queryBuilder.limit(10);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
