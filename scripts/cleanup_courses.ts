
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

async function cleanup() {
    console.log('Fetching courses and curriculums...');

    // 1. Get all courses
    const { data: courses, error: cError } = await supabase
        .from('courses')
        .select('*');
    if (cError) throw cError;

    // 2. Get all curriculums
    const { data: curriculums, error: currError } = await supabase
        .from('course_curriculums')
        .select('*');
    if (currError) throw currError;

    console.log(`Total Courses: ${courses.length}`);
    console.log(`Total Curriculums: ${curriculums.length}`);

    // 3. Identify courses that have the same title as a curriculum (that belongs to OTHER courses)
    // Actually, we want to remove courses that seem to be "sub-topics" if they are already covered by a main course's curriculum.

    // A simpler heuristic for this specific data mess:
    // The "Main" courses seem to be "DX推進担当者育成カリキュラム", "Webエンジニアリングマスター", "リスキル大学講座アーカイブ", "ITパスポート" (maybe).
    // The "Sub" courses are things like "デジタル応用", "動画制作", which appear as curriculums of "DX...".

    // Set of titles that exist as curriculums
    const curriculumTitles = new Set(curriculums.map(c => c.title));

    // Valid Main Courses we surely want to keep
    // We can identify them by ID if they were seeded by seed.sql (c0000...)
    // Or by the fact they contain sub-curriculums.

    // Let's find courses that are NOT parents of other curriculums, but HAVE titles matching existing curriculums.

    // Courses that are parents (have curriculums pointing to them)
    const parentCourseIds = new Set(curriculums.map(c => c.course_id));

    const coursesToDelete = courses.filter(c => {
        // If this course is a parent of some curriculum, KEEP IT.
        if (parentCourseIds.has(c.id)) return false;

        // If this course title matches a curriculum title, DELETE IT
        if (curriculumTitles.has(c.title)) return true;

        return false;
    });

    console.log(`Found ${coursesToDelete.length} redundant courses to delete:`);
    coursesToDelete.forEach(c => console.log(`- ${c.title} (${c.id})`));

    if (coursesToDelete.length > 0) {
        const idsToDelete = coursesToDelete.map(c => c.id);
        const { error: delError } = await supabase
            .from('courses')
            .delete()
            .in('id', idsToDelete);

        if (delError) {
            console.error('Error deleting courses:', delError);
        } else {
            console.log('Successfully deleted redundant courses.');
        }
    } else {
        console.log('No redundant courses found.');
    }
}

cleanup().catch(console.error);
