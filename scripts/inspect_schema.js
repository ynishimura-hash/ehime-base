
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use service role key to bypass RLS and see everything
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Service Role Key.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data, error } = await supabase
        .from('applications')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching data:", error);
    } else if (data && data.length > 0) {
        console.log("Found row:", data[0]);
        console.log("Keys:", Object.keys(data[0]));
    } else {
        console.log("No data found in applications table.");
        // Try to insert a dummy row if empty? Or just check interactions table as example
    }
}

inspect();
