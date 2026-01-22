
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use admin key to bypass RLS just in case
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { count: orgCount, error: orgError } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
    const { count: jobCount, error: jobError } = await supabase.from('jobs').select('*', { count: 'exact', head: true });

    console.log('Organizations:', orgCount, orgError?.message);
    console.log('Jobs:', jobCount, jobError?.message);
}

checkData();
