
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use ANON KEY to simulate client-side fetch
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('Checking read access with ANON key...');

    const { data, error } = await supabase
        .from('course_curriculums')
        .select('id, title')
        .limit(5);

    if (error) {
        console.error('RLS/Fetch Error:', error);
    } else {
        console.log(`Success! Found ${data.length} records.`);
        if (data.length > 0) {
            console.log('Sample:', data[0]);
        } else {
            console.log('Returned 0 records. This might indicate RLS masking data.');
        }
    }
}

checkRLS();
