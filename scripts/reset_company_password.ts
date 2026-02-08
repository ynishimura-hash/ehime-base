
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetCompanyPassword() {
    const email = 'company1@example.com';
    const newPassword = 'password123';

    console.log(`Searching for user: ${email}...`);

    // ユーザーリスト取得 (ページネーション対応が必要だが、開発環境なら少数のはず)
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('Error fetching users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User ${email} not found.`);
        return;
    }

    console.log(`Found user: ${user.id}`);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (updateError) {
        console.error('Error updating password:', updateError);
    } else {
        console.log(`\n✅ Password updated successfully!`);
        console.log(`   Email: ${email}`);
        console.log(`   New Password: ${newPassword}`);
        console.log(`\nLogin URL: http://localhost:3000/login/company`);
    }
}

resetCompanyPassword();
