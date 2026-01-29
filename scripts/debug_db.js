
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);


async function debug() {
    console.log('Testing connection to:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    console.log('Total Profiles:', userCount);

    const { data: orgs, error: oError } = await supabase.from('organizations').select('*');
    if (oError) {
        console.error('Error fetching organizations:', oError);
    } else {
        console.log('Total Organizations:', orgs.length);
        if (orgs.length > 0) {
            const types = [...new Set(orgs.map(o => o.type))];
            console.log('Organization types found:', types);
            console.log('Sample organization type:', orgs[0].type, typeof orgs[0].type);
        }
    }

    const { data: jobs, error: jError } = await supabase.from('jobs').select('*');
    if (jError) {
        console.error('Error fetching jobs:', jError);
    } else {
        console.log('Total Jobs:', jobs.length);
        if (jobs.length > 0) {
            const types = [...new Set(jobs.map(j => j.type))];
            console.log('Job types found:', types);
        }
    }
}

debug();

