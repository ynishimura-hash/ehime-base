
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogin(email: string, role: string) {
    console.log(`Checking login for ${role} (${email})...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'password123'
    });

    if (error) {
        console.error(`[${role}] Login Failed:`, error.message);
        if (error.message.includes('Email not confirmed')) {
            console.log('Suggestion: Need to confirm email or disable email confirmation in Supabase dashboard.');
        }
    } else {
        console.log(`[${role}] Login Success! User ID:`, data.user.id);
    }
}

async function main() {
    await checkLogin('test_seeker@example.com', 'Seeker');
    await checkLogin('test_company@example.com', 'Company');
}

main();
