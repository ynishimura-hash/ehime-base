
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role to bypass RLS (since invitee is not yet a member)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    try {
        // 1. Fetch Invite
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('organization_invitations')
            .select('*')
            .eq('token', token)
            .single();

        if (inviteError || !invite) {
            return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
        }

        // 2. Check Expiry / Usage
        if (invite.is_used) {
            return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 });
        }
        if (new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 });
        }

        // 3. Fetch Organization Details (Name, etc.)
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('name, description')
            .eq('id', invite.organization_id)
            .single();

        if (orgError) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json({ invite, organization: org });

    } catch (error: any) {
        console.error('Validate Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
