import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// GETメソッド: ユーザー一覧取得（RLSバイパス）
export async function GET(request: NextRequest) {
    try {
        // まず認証確認
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

        // 管理者確認
        const { data: adminProfile } = await adminClient
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

        if (!adminProfile || adminProfile.user_type !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // フィルター取得
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'all';

        // サービスロールで全ユーザー取得（RLSバイパス）
        let query = adminClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter && filter !== 'all') {
            query = query.eq('user_type', filter);
        }

        const { data: users, error } = await query;

        if (error) {
            console.error('Fetch users error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ users: users || [] });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, profile } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Create User in Auth
        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: profile.full_name || 'No Name',
                user_type: profile.user_type || 'student'
            }
        });

        if (userError) throw userError;

        // 2. Create Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                first_name: profile.first_name,
                last_name: profile.last_name,
                full_name: profile.full_name,
                user_type: profile.user_type,
                phone: profile.phone,
                dob: profile.dob,
                gender: profile.gender,
                company_name: profile.company_name,
                department: profile.department,
                university: profile.university,
                faculty: profile.faculty,
                bio: profile.bio,
                tags: profile.tags
            })
            .eq('id', userData.user.id);

        // Note: 'profiles' usually has a trigger to create a row on auth.users insert.
        // If so, we should UPDATE. If not, we INSERT.
        // Assuming typical Supabase starter, there might be a trigger.
        // Let's try attempting to select first?
        // Actually, if we use 'upsert' or just Insert and handle conflict it might be cleaner.
        // BUT, if trigger exists, Insert will duplicate or fail.
        // We will assume Trigger Exists (standard). So we UPDATE.
        // Wait, if we just created the user, the trigger *should* have run.
        // So we update the profile with extra details.

        if (profileError) {
            console.error('Profile update error:', profileError);
            // Verify if profile exists
            const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
            if (!existingProfile) {
                // Trigger didn't run or failed? Manual Insert.
                const { error: insertError } = await supabase.from('profiles').insert({
                    id: userData.user.id,
                    email: email, // If email column exists in profiles
                    ...profile
                });
                if (insertError) throw insertError;
            } else {
                throw profileError; // Real update error
            }
        }

        return NextResponse.json({ user: userData.user });

    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
