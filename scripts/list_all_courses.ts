
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

async function listAllCourses() {
    const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title, is_published, category, level, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Total Courses Found: ${courses.length}`);
    console.table(courses.map(c => ({
        title: c.title.substring(0, 30),
        published: c.is_published,
        category: c.category,
        level: c.level
    })));
}

listAllCourses();
