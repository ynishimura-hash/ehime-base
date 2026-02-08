
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

async function listPublishedCourses() {
    const { data, error } = await supabase
        .from('courses')
        .select('id, title, is_published')
        .eq('is_published', true);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data.length} published courses:`);
        data.forEach(c => console.log(`- [${c.id}] ${c.title}`));
    }
}

listPublishedCourses();
