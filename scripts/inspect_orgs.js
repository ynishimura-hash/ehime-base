
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectOrgs() {
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching orgs:", error);
    } else if (data && data.length > 0) {
        console.log("Found org:", data[0]);
        console.log("Keys:", Object.keys(data[0]));
        // Check types if possible, but keys tell a lot.
    } else {
        console.log("No data found in interactions table.");
    }
}

inspectOrgs();
