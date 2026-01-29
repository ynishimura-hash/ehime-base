import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// DELETE /api/elearning/modules/cleanup - Delete duplicate 基本メニュー modules
export async function DELETE() {
    try {
        console.log('API: Deleting duplicate 基本メニュー modules...');

        // まず削除対象を取得
        const { data: toDelete, error: fetchError } = await supabase
            .from('course_curriculums')
            .select('id, title')
            .eq('title', '基本メニュー');

        if (fetchError) {
            console.error('API: Error fetching modules to delete:', fetchError);
            throw fetchError;
        }

        console.log(`API: Found ${toDelete?.length || 0} modules to delete`);

        if (toDelete && toDelete.length > 0) {
            const ids = toDelete.map((m: any) => m.id);

            // 削除実行
            const { error: deleteError } = await supabase
                .from('course_curriculums')
                .delete()
                .in('id', ids);

            if (deleteError) {
                console.error('API: Error deleting modules:', deleteError);
                throw deleteError;
            }

            console.log(`API: Successfully deleted ${ids.length} modules`);

            return NextResponse.json({
                success: true,
                deletedCount: ids.length,
                deletedIds: ids
            });
        }

        return NextResponse.json({
            success: true,
            deletedCount: 0,
            message: 'No modules to delete'
        });

    } catch (error) {
        console.error('API cleanup error:', error);
        return NextResponse.json({ error: 'Failed to delete modules' }, { status: 500 });
    }
}
