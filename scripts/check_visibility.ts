
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use ANON key to simulate frontend client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
    console.log('--- Checking Visibility with ANON Key ---');

    // 1. Check Tracks (courses table)
    const { data: tracks, error: tracksError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('category', 'Track');

    if (tracksError) console.error('Error fetching tracks:', tracksError);
    else console.log(`Visible Tracks: ${tracks?.length || 0}`);

    if (tracks && tracks.length > 0) {
        const trackId = tracks[0].id;
        console.log(`Checking Modules for Track: ${tracks[0].title} (${trackId})`);

        // 2. Check Modules (course_curriculums)
        const { data: modules, error: modulesError } = await supabase
            .from('course_curriculums')
            .select('id, title')
            .eq('course_id', trackId);

        if (modulesError) console.error('Error fetching modules:', modulesError);
        else console.log(`Visible Modules: ${modules?.length || 0}`);

        if (modules && modules.length > 0) {
            // 3. Check Lessons (course_lessons)
            const moduleId = modules[0].id;
            const { data: lessons, error: lessonsError } = await supabase
                .from('course_lessons')
                .select('id, title')
                .eq('curriculum_id', moduleId);

            if (lessonsError) console.error('Error fetching lessons:', lessonsError);
            else console.log(`Visible Lessons for first module: ${lessons?.length || 0}`);
        }
    }
}

main();
