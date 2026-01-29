
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log('Testing fetchPublicCompaniesAction equivalent...');
    const { data, error } = await supabase.from('organizations').select('*');

    if (error) {
        console.error('Error fetching organizations:', error);
    } else {
        console.log(`Success! Found ${data.length} organizations.`);
        if (data.length > 0) {
            console.log('Sample Org:', data[0].name);
        } else {
            console.log('Detailed: Order table is empty.');
        }
    }
}

testFetch();
