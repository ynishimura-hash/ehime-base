const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables. Make sure .env.local exists and has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { count: orgCount, error: orgError } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
    const { count: approvedOrgCount, error: approvedOrgError } = await supabase.from('organizations').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: jobCount, error: jobError } = await supabase.from('jobs').select('*', { count: 'exact', head: true });

    if (orgError) console.error('Org Error:', orgError);
    if (approvedOrgError) console.error('Approved Org Error:', approvedOrgError);
    if (jobError) console.error('Job Error:', jobError);

    console.log(`Total Organizations: ${orgCount}`);
    console.log(`Approved Organizations: ${approvedOrgCount}`);
    console.log(`Total Jobs: ${jobCount}`);
}

checkData();
