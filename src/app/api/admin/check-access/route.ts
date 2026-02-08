import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Supabase Admin client（RLSをバイパス）
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

export async function GET(request: NextRequest) {
    try {
        // Cookieからセッションを取得
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

        // 未ログイン
        if (!session) {
            return NextResponse.json({ isAdmin: false, reason: 'not_logged_in' });
        }

        // サービスロールでprofilesを確認（RLSバイパス）
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

        if (error || !profile) {
            return NextResponse.json({ isAdmin: false, reason: 'profile_not_found' });
        }

        return NextResponse.json({
            isAdmin: profile.user_type === 'admin',
            userType: profile.user_type
        });
    } catch (error) {
        console.error('Check access error:', error);
        return NextResponse.json({ isAdmin: false, reason: 'error' });
    }
}

// 既存のPOSTも残しておく（互換性のため）
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ isAdmin: false });
        }

        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('user_type')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            return NextResponse.json({ isAdmin: false });
        }

        return NextResponse.json({ isAdmin: profile.user_type === 'admin' });
    } catch (error) {
        console.error('Check access error:', error);
        return NextResponse.json({ isAdmin: false });
    }
}
