
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFetch() {
    console.log('Fetching courses with curriculums and lessons...');
    const { data, error } = await supabase
        .from('courses')
        .select(`
            id,
            title,
            lessons:course_lessons(
                id,
                title
            ),
            title,
            lessons:course_lessons(
                id,
                title
            ),
            curriculums:course_curriculums(
                id,
                title,
                lessons:course_lessons(
                    id,
                    title
                )
            )
        `)
        .eq('id', '84894886-a7ee-40de-b9e9-dcfa4c274917')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Fetched ${data.length} courses.`);
    data.forEach(course => {
        console.log(`Course: ${course.title} (${course.id})`);
        if (course.lessons && course.lessons.length > 0) {
            console.log(`  Direct Lessons: ${course.lessons.length}`);
        }
        if (course.curriculums && course.curriculums.length > 0) {
            console.log(`  Curriculums: ${course.curriculums.length}`);
            course.curriculums.forEach((curr: any) => {
                console.log(`    - ${curr.title} (${curr.id})`);
                if (curr.lessons && curr.lessons.length > 0) {
                    console.log(`      Lessons: ${curr.lessons.length}`);
                    curr.lessons.forEach((l: any) => console.log(`        * ${l.title}`));
                } else {
                    console.log(`      No lessons found in this curriculum.`);
                }
            });
        } else {
            console.log(`  No curriculums found.`);
        }
        console.log('---');
    });
}

debugFetch();
