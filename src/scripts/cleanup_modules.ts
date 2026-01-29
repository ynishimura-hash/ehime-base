import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://uqmqhhdtdxfuitkwsqxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbXFoaGR0ZHhmdWl0a3dzcXh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjEzODg4MSwiZXhwIjoyMDUxNzE0ODgxfQ.TfAstLdP0TxD1POH18xn0tZylJlbPQ-d8K1Hb3WOkrg'
);

async function deleteBasicMenuModules() {
    console.log('Fetching modules with title "基本メニュー"...');

    const { data: toDelete, error: fetchError } = await supabase
        .from('course_curriculums')
        .select('id, title')
        .eq('title', '基本メニュー');

    if (fetchError) {
        console.error('Error fetching:', fetchError);
        return;
    }

    console.log(`Found ${toDelete?.length || 0} modules to delete`);

    if (toDelete && toDelete.length > 0) {
        const ids = toDelete.map((m: any) => m.id);
        console.log('Deleting IDs:', ids);

        const { error: deleteError } = await supabase
            .from('course_curriculums')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error('Error deleting:', deleteError);
        } else {
            console.log('Successfully deleted', ids.length, 'modules');
        }
    }

    // List remaining modules
    const { data: remaining } = await supabase
        .from('course_curriculums')
        .select('id, title')
        .order('title');

    console.log('Remaining modules:', remaining?.length);
    remaining?.forEach((m: any) => console.log(`  - ${m.title}`));
}

deleteBasicMenuModules();
