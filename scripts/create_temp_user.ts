
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

async function createTempUser() {
    const email = `test_user_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Creating user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Test User',
                user_type: 'seeker'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`ID: ${data.user?.id}`);
    }
}

createTempUser();
