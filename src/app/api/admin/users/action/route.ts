import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
    try {
        // 1. 管理者認証チェック
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // プロフィールで管理者確認
        const { data: adminProfile } = await adminClient
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

        if (!adminProfile || adminProfile.user_type !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. リクエスト解析
        const body = await request.json();
        const { action, userIds, value } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'Invalid user IDs' }, { status: 400 });
        }

        // 3. アクション実行
        let results = [];
        let errorCount = 0;

        for (const userId of userIds) {
            try {
                if (action === 'delete') {
                    // ユーザー削除 (Auth & Profile)
                    // Supabase Authの削除はカスケード設定によっては関連データも消えるが、
                    // 安全のため adminClient.auth.admin.deleteUser を使う
                    const { error } = await adminClient.auth.admin.deleteUser(userId);
                    if (error) throw error;

                    // ProfileはAuth削除で消える設定にしていない場合は手動削除が必要だが、
                    // 一般的には Auth 削除で連動させるか、論理削除にする。
                    // 今回は物理削除とする。

                } else if (action === 'toggle_status') {
                    // ステータス変更 (ban)
                    // value === true なら ban, false なら unban
                    const banDuration = value ? '876000h' : '0s'; // 100年 or 解除
                    const { error } = await adminClient.auth.admin.updateUserById(userId, {
                        ban_duration: banDuration
                    });
                    if (error) throw error;

                } else if (action === 'reset_password') {
                    // パスワードリセット (ランダムパスワード設定)
                    // value に新しいパスワードが入っていると想定
                    if (!value) throw new Error('Password required');
                    const { error } = await adminClient.auth.admin.updateUserById(userId, {
                        password: value
                    });
                    if (error) throw error;

                } else if (action === 'update_profile') {
                    // プロフィール更新
                    // value: { full_name, email, user_type, dob, occupation_status, ... }
                    if (!value) throw new Error('Update data required');

                    const { email, ...updates } = value;
                    const allowedFields = [
                        'full_name', 'user_type', 'dob', 'avatar_url',
                        'occupation_status', 'bio', 'school_name',
                        'school_faculty', 'school_year', 'company_name', 'position',
                        'phone', 'gender', 'school_type', 'worker_status', 'university', 'faculty'
                    ];

                    const profileUpdates: any = {};
                    allowedFields.forEach(field => {
                        if (updates[field] !== undefined) {
                            profileUpdates[field] = updates[field];
                        }
                    });

                    // 1. Auth情報の更新 (Email)
                    if (email) {
                        const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
                            email: email,
                            email_confirm: true // 自動確認済みにする
                        });
                        if (authError) throw authError;
                        // profiles側のemailも同期（もしスキーマ上存在するなら）
                        // profileUpdates.email = email; 
                    }

                    // 2. Profilesテーブルの更新
                    if (Object.keys(profileUpdates).length > 0) {
                        const { error: profileError } = await adminClient
                            .from('profiles')
                            .update(profileUpdates)
                            .eq('id', userId);
                        if (profileError) throw profileError;
                    }
                }

                // 4. 監査ログの記録 (成功時のみ)
                try {
                    await adminClient.from('audit_logs').insert({
                        user_id: session.user.id, // 操作者（管理者）
                        action: action === 'toggle_status' ? (value ? 'reject' : 'approve') : // status toggle is logically ban/unban, mapping reset/update is straight forward
                            action === 'reset_password' ? 'update' :
                                action === 'update_profile' ? 'update' :
                                    action, // delete maps directly
                        table_name: 'profiles', // Mostly operating on profiles/users
                        record_id: userId,
                        description:
                            action === 'delete' ? 'ユーザーを削除しました' :
                                action === 'toggle_status' ? `ステータスを変更しました (Ban: ${value})` :
                                    action === 'reset_password' ? 'パスワードをリセットしました' :
                                        action === 'update_profile' ? 'プロフィールを更新しました' :
                                            `アクションを実行しました: ${action}`,
                        new_data: action === 'update_profile' ? value :
                            action === 'toggle_status' ? { banned: value } :
                                null
                    });
                } catch (logError) {
                    console.error(`Failed to log audit for ${userId}:`, logError);
                    // Don't fail the main action just because logging failed, but log strictly
                }

                results.push({ id: userId, status: 'success' });
            } catch (err: any) {
                console.error(`Action ${action} failed for ${userId}:`, err);
                results.push({ id: userId, status: 'error', message: err.message });
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            results,
            message: `${userIds.length - errorCount}件の処理に成功しました`
        });

    } catch (error: any) {
        console.error('Admin action error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
