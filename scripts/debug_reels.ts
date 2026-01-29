
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Checking Media Library...');
    const { data: media, error } = await supabase.from('media_library').select('*');
    if (error) {
        console.error('Error fetching media:', error);
        return;
    }

    console.log(`Total Media: ${media.length}`);
    media.forEach((m: any) => {
        console.log(`- ID: ${m.id}, Title: ${m.title}, OrgID: ${m.organization_id}, JobID: ${m.job_id}, Type: ${m.type}`);
    });

    console.log('\nChecking Companies...');
    const { data: companies } = await supabase.from('organizations').select('id, name');
    console.log(`Total Companies: ${companies?.length}`);
    companies?.forEach((c: any) => {
        const companyReels = media.filter((m: any) => m.organization_id === c.id);
        const companyReelsNoJob = companyReels.filter((m: any) => !m.job_id);
        console.log(`Company: ${c.name} (${c.id}) has ${companyReels.length} reels (Strict NoJob: ${companyReelsNoJob.length})`);
    });
}

main();
