
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('--- Updating Course Images ---');

    const updates = [
        { title: 'リスキル大学講座アーカイブ', image: '/courses/archive.png' },
        { title: 'ITパスポート', image: '/courses/it_passport.png' },
        { title: 'キャリアサポート', image: '/courses/career.png' },
        { title: 'Webエンジニアリングマスター', image: '/courses/archive.png' } // Reuse for now
    ];

    for (const update of updates) {
        console.log(`Updating ${update.title}...`);
        // Use ILIKE for somewhat fuzzy matching
        const { error } = await supabase
            .from('course_curriculums') // Note: Using course_curriculums as these are the "Modules" displayed
            .update({ thumbnail_url: update.image })
            .ilike('title', `%${update.title}%`);

        if (error) console.error(`Failed to update ${update.title}:`, error);
        else console.log('Updated.');
    }
}

main();
