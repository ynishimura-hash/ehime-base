
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

async function restore() {
    console.log('Fetching curriculums and courses...');

    // 1. Get all curriculums
    const { data: curriculums, error: currError } = await supabase
        .from('course_curriculums')
        .select('*');
    if (currError) throw currError;

    // 2. Get all courses
    const { data: courses, error: cError } = await supabase
        .from('courses')
        .select('*');
    if (cError) throw cError;

    const courseTitles = new Set(courses.map(c => c.title));

    // Find curriculums that do NOT have a matching course title
    // Logic: If a curriculum exists but no course has that title, we likely deleted it.
    // Note: This assumes 1:1 mapping of title for these "module" courses.

    const curriculumsToRestore = curriculums.filter(c => !courseTitles.has(c.title));

    console.log(`Found ${curriculumsToRestore.length} curriculums missing as courses:`);
    curriculumsToRestore.forEach(c => console.log(`- ${c.title}`));

    if (curriculumsToRestore.length > 0) {
        // Create new courses for these curriculums
        const newCourses = curriculumsToRestore.map(c => ({
            title: c.title,
            description: c.description || `Course for ${c.title}`,
            // Use dummy values for required fields or copy from a template
            category: 'Reskilling', // Default
            level: '初級',
            duration: '不明',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', // Placeholder
            is_published: true,
            // We let Supabase generate the ID
        }));

        const { data, error: insertError } = await supabase
            .from('courses')
            .insert(newCourses)
            .select();

        if (insertError) {
            console.error('Error restoring courses:', insertError);
        } else {
            console.log(`Successfully restored ${data.length} courses.`);
            data.forEach(c => console.log(`  + Restored: [${c.id}] ${c.title}`));
        }
    } else {
        console.log('No missing courses found to restore.');
    }
}

restore().catch(console.error);
