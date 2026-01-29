import { createClient } from '@/utils/supabase/server';

async function main() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Latest Profile:', JSON.stringify(data, null, 2));
    }
}

main();
