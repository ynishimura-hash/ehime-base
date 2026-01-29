const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugJobs() {
    console.log('--- Debugging Jobs Data ---');
    try {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations (
                    id, name, type
                )
            `);

        if (error) {
            console.error('Error fetching jobs:', error);
            return;
        }

        console.log(`Total jobs found: ${data.length}`);

        const types = {};
        const orgStatus = { attached: 0, missing: 0 };

        data.forEach(job => {
            const type = job.type || (job.value_tags_ai ? job.value_tags_ai.type : 'N/A');
            types[type] = (types[type] || 0) + 1;

            if (job.organization) {
                orgStatus.attached++;
            } else {
                orgStatus.missing++;
            }
        });

        console.log('Job Types found:', types);
        console.log('Organization Join Status:', orgStatus);

        if (data.length > 0) {
            console.log('Sample Job (first row):', JSON.stringify(data[0], null, 2));
        }

    } catch (e) {
        console.error('Debug script failed:', e);
    }
}

debugJobs();
