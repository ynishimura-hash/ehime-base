
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

async function check() {
    console.log('Fetching user_course_recommendations...');

    const { data: recs, error } = await supabase
        .from('user_course_recommendations')
        .select(`
            id,
            user_id,
            course_id,
            value_id,
            reason_message,
            created_at
        `)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching recommendations:', error);
        return;
    }

    console.log(`Found ${recs.length} recent recommendations:`);
    recs.forEach(r => {
        console.log(`\n[CourseID: ${r.course_id}] (Value: ${r.value_id})`);
        console.log(`Reason: "${r.reason_message}"`);
    });
}

check().catch(console.error);
