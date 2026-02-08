
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

async function publishCourses() {
    // 1. Publish all 'Reskilling' courses
    const { error: error1 } = await supabase
        .from('courses')
        .update({ is_published: true })
        .eq('category', 'Reskilling');

    if (error1) console.error('Error publishing Reskilling:', error1);
    else console.log('Published Reskilling courses.');

    // 2. Ensure IT Passport (Qualification) and Business (Archive) are published
    const { error: error2 } = await supabase
        .from('courses')
        .update({ is_published: true })
        .in('category', ['資格試験', 'ビジネス']);

    if (error2) console.error('Error publishing others:', error2);
    else console.log('Published IT Passport & Business courses.');
}

publishCourses();
