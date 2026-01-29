import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { profileData } = body;

        const supabase = await createClient();

        // 1. Try to get user from cookie session
        let { data: { user }, error: authError } = await supabase.auth.getUser();

        // 2. If no cookie session, check for Bearer token in Authorization header
        if (!user || authError) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                console.log('Attempting authentication via Bearer token...');
                const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);

                if (tokenUser && !tokenError) {
                    user = tokenUser;
                    authError = null; // Clear error if token auth succeeded
                }
            }
        }

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Security: Enforce ID match
        const safeProfileData = {
            ...profileData,
            id: user.id, // overwrite ID with authenticated one
            email: profileData.email || user.email // Fallback to auth email if missing
        };

        // Call RPC
        const { error: rpcError } = await supabase.rpc('register_user_profile', {
            target_id: user.id,
            profile_data: safeProfileData
        });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId: user.id });

    } catch (err: any) {
        console.error('Onboarding API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
