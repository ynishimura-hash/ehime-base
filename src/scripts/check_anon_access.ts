
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnonAccess() {
    // Try to fetch as anon
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('id, name, type, status');
    console.log('Anon Organizations Fetch:', orgs?.length, orgError?.message);
    if (orgs && orgs.length > 0) {
        console.log('Sample Org:', orgs[0]);
    }

    // Check status distribution (using admin key internally to debug why anon fails if it fails)
    // Actually we can't easily switch keys in one client instance, so I'll trust the anon result first.
}

checkAnonAccess();
