
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Construct connection string
// Format: postgres://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ref = supabaseUrl.split('//')[1].split('.')[0];
// Encode password to handle special characters like *, ?, etc.
const password = encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || '');
const dbUrl = `postgres://postgres.${ref}:${password}@db.${ref}.supabase.co:5432/postgres`;

async function update() {
    console.log('Connecting to database...');
    const client = new Client({
        connectionString: dbUrl,
    });

    try {
        await client.connect();
        console.log('Connected.');

        // 1. Add image column to course_curriculums if not exists
        console.log('Ensuring image column exists in course_curriculums...');
        await client.query(`
            ALTER TABLE course_curriculums 
            ADD COLUMN IF NOT EXISTS image TEXT;
        `);

        // 2. Update Tracks (courses table)
        console.log('Updating Tracks...');
        await client.query(`
            UPDATE courses 
            SET image = '/courses/track_dx.png'
            WHERE title LIKE '%DX推進%' AND category='Track';
        `);
        await client.query(`
            UPDATE courses 
            SET image = '/courses/track_web.png'
            WHERE title LIKE '%Web%' AND category='Track';
        `);

        // 3. Update Curriculums/Modules (course_curriculums table)
        console.log('Updating Curriculums...');

        // Reskill Archive
        await client.query(`
            UPDATE course_curriculums 
            SET image = '/courses/reskill_archive.png'
            WHERE title LIKE '%リスキル大学%';
        `);

        // IT Passport
        await client.query(`
            UPDATE course_curriculums 
            SET image = '/courses/it_passport.png'
            WHERE title LIKE '%ITパスポート%';
        `);

        // Digital Basics (Assuming title contains 'デジタル' or '基礎' or referring to category logic used in seed)
        // In seed, "Digital Basics" might be part of DX track or just a module?
        // Let's assume modules with "デジタル" or mapped to Digital Basics
        // Actually, looking at mock data, "デジタル基礎（必修）" was a CATEGORY for lessons.
        // The curriculum title might be different.
        // The mock data had "ITパスポート" (title).
        // Let's update anything with "デジタル" or "基礎" if appropriate, 
        // but maybe just stick to what we know.

        // FE Exam (Basic Information)
        // If there is any module related to "基本情報", update it.
        await client.query(`
            UPDATE course_curriculums 
            SET image = '/courses/fe_exam.png'
            WHERE title LIKE '%基本情報%';
        `);

        // Digital Basics
        await client.query(`
            UPDATE course_curriculums 
            SET image = '/courses/digital_basics.png'
            WHERE title LIKE '%デジタル%' OR title LIKE '%基礎%';
        `);

        console.log('Update complete!');

    } catch (err) {
        console.error('Error during update:', err);
    } finally {
        await client.end();
    }
}

update();
