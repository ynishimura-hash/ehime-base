
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspect() {
    const { data, error } = await supabase.from('jobs').select('*').limit(1);
    if (error) {
        console.error(error);
    } else {
        if (data.length > 0) {
            console.log("Keys:", Object.keys(data[0]));
            console.log("Example:", data[0]);
        } else {
            console.log("No data found in jobs table.");
        }
    }
}

inspect();
