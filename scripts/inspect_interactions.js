
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectInteractions() {
    const { data: interactions, error } = await supabase
        .from('interactions')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching interactions:", error);
    } else if (interactions && interactions.length > 0) {
        console.log("Found interaction:", interactions[0]);
        console.log("Keys:", Object.keys(interactions[0]));
    } else {
        console.log("No data found in interactions table.");
    }
}

inspectInteractions();
