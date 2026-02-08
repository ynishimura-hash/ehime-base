
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fix() {
    console.log('1. Clearing all user course recommendations...');

    const { error: clearError } = await supabase
        .from('user_course_recommendations') // Correct table name
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (clearError) {
        console.error('Error clearing recommendations:', clearError);
    } else {
        console.log('Successfully cleared user course recommendations.');
    }

    console.log('2. Deleting "Web Engineering Master" course...');
    // This is likely a curriculum that was wrongly inserted as a course
    const { error: delError } = await supabase
        .from('courses')
        .delete()
        .eq('title', 'Webエンジニアリングマスター');

    if (delError) {
        console.error('Error deleting course:', delError);
    } else {
        console.log('Successfully deleted "Web Engineering Master" course.');
    }
}

fix().catch(console.error);
