
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// FORCE USE OF ANON KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseKey) {
    console.error('No ANON KEY found!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Checking Visibility (ANON KEY) ---');
    console.log('URL:', supabaseUrl);

    // 1. Check Tracks (courses where category='Track')
    const { data: tracks, error: tErr } = await supabase
        .from('courses')
        .select('*')
        .eq('category', 'Track')
        .eq('is_published', true);

    if (tErr) {
        console.error('FAILED to fetch tracks:', tErr);
    } else {
        console.log(`Visible Tracks: ${tracks.length}`);
        if (tracks.length > 0) {
            console.log('First Track:', tracks[0].title, tracks[0].id);

            // 2. Check Modules for this track
            const { data: modules, error: mErr } = await supabase
                .from('course_curriculums')
                .select('*') // Simple select first
                .eq('course_id', tracks[0].id);

            if (mErr) {
                console.error('FAILED to fetch modules:', mErr);
            } else {
                console.log(`Visible Modules for Track 1: ${modules.length}`);
            }
        }
    }
}

main();
