
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking tables...');

    // Try to select from potential tables to see if they exist
    const tables = ['casual_chats', 'messages', 'chat_threads', 'interactions', 'organizations', 'profiles'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`[${table}] Error: ${error.message} (Code: ${error.code})`);
        } else {
            console.log(`[${table}] Exists. Count: ${data}`);
        }
    }

    // Check if we can insert into casual_chats
    /*
    const { data: insertCheck, error: insertError } = await supabase.from('casual_chats').insert({
      user_id: 'test_user',
      company_id: 'test_company'
    }).select();
    */
}

checkTables();
