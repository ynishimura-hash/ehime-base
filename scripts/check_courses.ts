
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

async function checkCourses() {
    console.log('Fetching courses...');
    const { data: courses, error } = await supabase
        .from('courses')
        .select('*');

    if (error) {
        console.error('Error fetching courses:', error);
        return;
    }

    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => {
        console.log(`- [${c.id}] ${c.title} (Published: ${c.is_published})`);
    });

    console.log('\nFetching course_curriculums...');
    const { data: curriculums, error: currError } = await supabase
        .from('course_curriculums')
        .select('*');

    if (currError) {
        console.error('Error fetching curriculums:', currError);
        return;
    }
    console.log(`Found ${curriculums.length} curriculums:`);
    curriculums.forEach(c => {
        console.log(`- [${c.id}] ${c.title} (CourseID: ${c.course_id})`);
    });
}

checkCourses();
