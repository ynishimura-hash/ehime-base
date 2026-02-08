
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking All Company Profiles...');

    // Fetch all profiles where user_type is 'company'
    // Also try to join with organizations if possible, but profiles has company_name usually
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('email, company_name, full_name, id')
        .eq('user_type', 'company')
        .order('email');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('No company profiles found.');
        return;
    }

    console.log(`Found ${profiles.length} company profiles:`);
    console.log('| Email | Company Name | Full Name |');
    console.log('|---|---|---|');
    profiles.forEach(p => {
        const name = p.company_name || 'N/A';
        console.log(`| ${p.email} | ${name} | ${p.full_name || ''} |`);
    });
}

checkData();
