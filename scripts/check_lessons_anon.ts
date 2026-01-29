
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // ANON KEY

if (!supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Checking Lesson Visibility (ANON KEY) ---');

    // 1. Get a module
    const { data: modules } = await supabase.from('course_curriculums').select('id').limit(1);
    if (!modules || modules.length === 0) return;
    const modId = modules[0].id;

    // 2. Fetch Lessons for that module
    const { data: lessons, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('curriculum_id', modId);

    if (error) {
        console.error('FAILED to fetch lessons:', error);
    } else {
        console.log(`Visible Lessons for Module ${modId}: ${lessons.length}`);
    }

    // 3. Test the exact Join Query used in Service
    const { data: joinData, error: joinErr } = await supabase
        .from('course_curriculums')
        .select(`*, lessons: course_lessons(*)`)
        .eq('id', modId);

    if (joinErr) {
        console.error('FAILED Join Query:', joinErr);
    } else {
        console.log('Join Query Success:', joinData?.length);
    }
}

main();
