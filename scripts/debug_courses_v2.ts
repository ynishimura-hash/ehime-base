
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Debugging Courses Fetch ---');

    // 1. Get Tracks
    const { data: tracks, error: tErr } = await supabase
        .from('courses')
        .select('*')
        .eq('category', 'Track')
        .eq('is_published', true);

    if (tErr) {
        console.error('Error fetching tracks:', tErr);
        return;
    }
    console.log(`Found ${tracks.length} tracks.`);
    if (tracks.length === 0) return;

    const trackId = tracks[0].id; // Use first track
    console.log(`Testing fetch for Track ID: ${trackId} (${tracks[0].title})`);

    // 2. Fetch Modules (simulating getCoursesForTrack)
    const { data: modules, error: mErr } = await supabase
        .from('course_curriculums')
        .select(`
                *,
                lessons: course_lessons(*)
            `)
        .eq('course_id', trackId)

    if (mErr) {
        console.error('FAILED to fetch modules:', mErr);
    } else {
        console.log(`SUCCESS. Found ${modules.length} modules.`);
        if (modules.length > 0) {
            console.log('Sample Module Keys:', Object.keys(modules[0]));
        }
    }
}

main();
