
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetData() {
    console.log('Resetting User Recommendations...');
    const { error } = await supabase
        .from('user_course_recommendations')
        .delete()
        .not('id', 'is', null); // Delete all

    if (error) {
        console.error('Error deleting recommendations:', error);
    } else {
        console.log('Successfully deleted all recommendations.');
    }
}

resetData();
