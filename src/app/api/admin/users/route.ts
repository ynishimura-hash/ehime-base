import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

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
