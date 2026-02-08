
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    const { error } = await supabase
        .from('courses')
        .delete()
        .ilike('title', 'Dummy Course%');

    if (error) {
        console.error('Error deleting dummy courses:', error);
    } else {
        console.log('Successfully deleted dummy courses.');
    }
}

cleanup();
