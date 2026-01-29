
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkSchema() {
  // Try to insert a dummy row to get column error, or select * limit 0
  const { error } = await supabase.from('casual_chats').select('*').limit(1);
  if (error) console.log('Select error:', error);
  else console.log('Select success (table exists)');
}
checkSchema();

