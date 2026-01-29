
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testElearning() {
    console.log('--- Testing E-Learning Data ---');

    // 1. Check Tracks (category='Track')
    console.log('\n1. Fetching Tracks (courses w/ category="Track")...');
    const { data: tracks, error: trackError } = await supabase
        .from('courses')
        .select('*');
    // .eq('category', 'Track'); // Check ALL courses first to see what's there

    if (trackError) console.error('Error fetching courses:', trackError);
    else {
        console.log(`Found ${tracks.length} courses total.`);
        tracks.forEach(c => console.log(` - [${c.id}] ${c.title} (Category: ${c.category}, Published: ${c.is_published})`));

        const actualTracks = tracks.filter(c => c.category === 'Track');
        console.log(`> Filtered by category='Track': ${actualTracks.length}`);
    }

    // 2. Check Curriculums (course_curriculums)
    console.log('\n2. Fetching Curriculums (course_curriculums)...');
    const { data: currs, error: currError } = await supabase
        .from('course_curriculums')
        .select('*');

    if (currError) console.error('Error fetching curriculums:', currError);
    else {
        console.log(`Found ${currs.length} curriculums.`);
        if (currs.length > 0) {
            console.log(` Sample: [${currs[0].id}] ${currs[0].title} (CourseID: ${currs[0].course_id})`);
        }
    }
}

testElearning();
