
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
    process.exit(1);
}

// Create client with ANTON KEY (simulates browser/public access)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonFetch() {
    console.log('--- Testing E-Learning Data with ANON KEY ---');

    // 1. Check Tracks
    console.log('\n1. Fetching Tracks (courses)...');
    const { data: tracks, error: trackError } = await supabase
        .from('courses')
        .select('*');

    if (trackError) {
        console.error('Error fetching courses:', trackError);
    } else {
        console.log(`Found ${tracks.length} courses.`);
        if (tracks.length === 0) {
            console.log('NOTE: Returned 0 rows. RLS might be hiding them if table is not empty.');
        }
    }
}

testAnonFetch();
