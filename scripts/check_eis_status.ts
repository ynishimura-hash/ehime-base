
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
    console.log('Checking EIS Company Status...');
    const { data: companies, error } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', '%EIS%');

    if (error) {
        console.error('Error fetching companies:', error);
        return;
    }

    if (!companies || companies.length === 0) {
        console.log('No company found matching "EIS"');
    } else {
        companies.forEach(c => {
            console.log(`ID: ${c.id}`);
            console.log(`Name: ${c.name}`);
            console.log(`Status: ${c.status}`); // Critical check
            console.log(`Is Active: ${c.is_active} (if column exists)`);
        });
    }
}

main();
