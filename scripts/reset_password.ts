// y.nishimura@eis-reach.comのパスワードをリセットするスクリプト
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetPassword() {
    const email = 'h.kawamoto@eis-reach.com';
    const newPassword = 'eisreach24';

    // まずユーザーのIDを取得
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('ユーザーリスト取得エラー:', listError);
        return;
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
        console.error(`ユーザー ${email} が見つかりません`);
        return;
    }

    console.log(`ユーザーを発見: ${user.id} (${user.email})`);

    // パスワードを更新
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (error) {
        console.error('パスワード更新エラー:', error);
    } else {
        console.log('✅ パスワードを正常に更新しました！');
        console.log(`   メール: ${email}`);
        console.log(`   新パスワード: ${newPassword}`);
    }
}

resetPassword();
