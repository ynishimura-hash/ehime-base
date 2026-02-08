
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

async function seedCourses() {
    const { count, error } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

    if (error) {
        console.error('Error fetching count:', error);
        return;
    }

    console.log(`Current published courses: ${count}`);

    if ((count || 0) < 14) {
        const needed = 14 - (count || 0);
        console.log(`Seeding ${needed} dummy courses...`);

        const dummyCourses = Array.from({ length: needed }).map((_, i) => ({
            title: `Dummy Course ${i + 1}`,
            description: `This is a dummy course for testing unique recommendations.`,
            category: 'IT・Technology',
            level: 'Beginner',
            is_published: true
        }));

        const { error: insertError } = await supabase
            .from('courses')
            .insert(dummyCourses);

        if (insertError) {
            console.error('Error seeding courses:', insertError);
        } else {
            console.log('Successfully seeded dummy courses.');
        }
    } else {
        console.log('Enough courses exist. Skipping seed.');
    }
}

seedCourses();
