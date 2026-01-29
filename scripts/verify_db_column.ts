
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (serviceKey) {
    console.log('SUPABASE_SERVICE_ROLE_KEY is present.');
} else {
    console.log('SUPABASE_SERVICE_ROLE_KEY is MISSING.');
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying course_lessons table schema...');

    // 1. Try to fetch one lesson and see the returned columns
    const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching lessons:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No lessons found to verify.');
        return;
    }

    const lesson = data[0];
    console.log('Fetched lesson keys:', Object.keys(lesson));

    if ('material_url' in lesson) {
        console.log('SUCCESS: "material_url" column exists!');
        console.log('Current value:', lesson.material_url);

        // Try to update it if we can (might fail due to RLS if unauthenticated)
        // We won't try update to avoid RLS error confusion, existence is step 1.
    } else {
        console.error('FAILURE: "material_url" column does NOT exist in the returned data.');
    }
}

verify();
