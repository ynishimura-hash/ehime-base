import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase Admin クライアント（サービスロールキーを使用）
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const { email, password, fullName, userType } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'メールアドレスとパスワードは必須です' },
                { status: 400 }
            );
        }

        // 1. Supabase Authでユーザー作成
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // メール確認をスキップ
        });

        if (authError) {
            console.error('Auth error:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'ユーザー作成に失敗しました' },
                { status: 500 }
            );
        }

        // 2. profilesテーブルにレコード作成（usersテーブル経由）
        // 最初にusersテーブルを確認
        const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', authData.user.id)
            .single();

        // usersテーブルにレコードがない場合は作成
        if (!existingUser) {
            const { error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: email,
                    name: fullName || email.split('@')[0],
                });

            if (userError) {
                console.error('Users table insert error:', userError);
                // usersテーブルがない場合はprofilesに直接挿入を試みる
            }
        }

        // 3. profilesテーブルに挿入/更新
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email: email,
                full_name: fullName || email.split('@')[0],
                user_type: userType || 'student',
            }, { onConflict: 'id' })
            .select()
            .single();

        if (profileError) {
            console.error('Profiles error:', profileError);
            // プロフィール作成に失敗してもユーザーは作成されている
            return NextResponse.json({
                success: true,
                user: authData.user,
                profile: null,
                warning: 'ユーザーは作成されましたが、プロフィール設定に問題がありました。SQLで手動設定してください。'
            });
        }

        return NextResponse.json({
            success: true,
            user: authData.user,
            profile: profileData,
            message: 'ユーザーを作成しました'
        });

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました' },
            { status: 500 }
        );
    }
}
