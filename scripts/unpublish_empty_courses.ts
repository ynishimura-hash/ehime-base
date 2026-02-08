
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function unpublishEmpty() {
    console.log('Checking for empty published courses...');

    // Fetch all published courses with their curriculums
    const { data: courses, error } = await supabase
        .from('courses')
        .select(`
            id,
            title,
            curriculums:course_curriculums(id)
        `)
        .eq('is_published', true);

    if (error) {
        console.error('Error fetching courses:', error);
        return;
    }

    console.log(`Found ${courses.length} published courses.`);

    const emptyCourses = courses.filter(c => !c.curriculums || c.curriculums.length === 0);

    if (emptyCourses.length === 0) {
        console.log('No empty published courses found.');
        return;
    }

    console.log(`Found ${emptyCourses.length} empty courses (no curriculums):`);
    emptyCourses.forEach(c => console.log(`- ${c.title} (${c.id})`));

    // Unpublish them
    for (const course of emptyCourses) {
        const { error: updateError } = await supabase
            .from('courses')
            .update({ is_published: false })
            .eq('id', course.id);

        if (updateError) {
            console.error(`Failed to unpublish ${course.title}:`, updateError);
        } else {
            console.log(`Unpublished: ${course.title}`);
        }
    }

    console.log('Done.');
}

unpublishEmpty();
