
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLinkage() {
    console.log('Checking Tracks (courses where category="Track")...');
    const { data: tracks, error: trackError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('category', 'Track');

    if (trackError) {
        console.error('Error fetching tracks:', trackError);
        return;
    }

    console.log(`Found ${tracks.length} tracks:`);
    tracks.forEach(t => console.log(` - [${t.title}] ID: ${t.id}`));

    for (const track of tracks) {
        const { data: modules, error: modError } = await supabase
            .from('course_curriculums')
            .select('id, title')
            .eq('course_id', track.id);

        if (modError) {
            console.error(`Error fetching modules for track ${track.title}:`, modError);
        } else {
            console.log(`Track [${track.title}] has ${modules.length} modules.`);
            modules.forEach(m => console.log(`   -> Module: ${m.title}`));
        }
    }

    // Check for orphaned modules
    const { data: orphans } = await supabase
        .from('course_curriculums')
        .select('id, title, course_id');

    // Filter locally or check null/mismatch
    const orphanCount = orphans.filter(o => !tracks.find(t => t.id === o.course_id)).length;
    console.log(`Total modules in DB: ${orphans.length}. Orphans (no valid track parent): ${orphanCount}`);
    if (orphanCount > 0) {
        console.log('Sample orphans:', orphans.filter(o => !tracks.find(t => t.id === o.course_id)).slice(0, 3));
    }
}

checkLinkage();
