
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testClientFetch() {
    console.log('--- Testing Client Mode (Anon Key) Fetch ---');

    // 1. Fetch Tracks
    console.log('1. Fetching Tracks...');
    const { data: tracks, error: trackError } = await supabase
        .from('courses')
        .select('*')
        .eq('category', 'Track')
        .eq('is_published', true);

    if (trackError) {
        console.error('Error fetching tracks:', trackError);
        return;
    }

    console.log(`Found ${tracks.length} tracks.`);
    if (tracks.length === 0) return;

    const trackId = tracks[0].id;
    console.log(`Using Track: ${tracks[0].title} (${trackId})`);

    // 2. Fetch Curriculums (Simulate getCoursesForTrack)
    console.log(`2. Fetching Curriculums for Track ID: ${trackId}...`);
    const { data: courses, error: courseError } = await supabase
        .from('course_curriculums')
        .select(`
            *,
            lessons: course_lessons(*)
        `)
        .eq('course_id', trackId)
        .order('order_index');

    if (courseError) {
        console.error('Error fetching curriculums:', courseError);
    } else {
        console.log(`Found ${courses.length} curriculums/courses.`);
        courses.forEach(c => {
            console.log(` - ${c.title} (Lessons: ${c.lessons.length})`);
        });
    }
}

testClientFetch();
