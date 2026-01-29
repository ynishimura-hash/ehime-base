
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking columns...');

    // Check courses (Tracks)
    const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .limit(1);

    if (coursesError) console.error('Error fetching courses:', coursesError);
    else if (courses && courses.length > 0) {
        console.log('Courses columns:', Object.keys(courses[0]));
    } else {
        console.log('Courses table empty or no data');
    }

    // Check course_curriculums (Modules)
    const { data: curriculums, error: currError } = await supabase
        .from('course_curriculums')
        .select('*')
        .limit(1);

    if (currError) console.error('Error fetching course_curriculums:', currError);
    else if (curriculums && curriculums.length > 0) {
        console.log('Course_curriculums columns:', Object.keys(curriculums[0]));
    } else {
        console.log('Course_curriculums table empty or no data');
    }
}

check();
