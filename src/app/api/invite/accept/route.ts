
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { token, userId } = await req.json();

        if (!token || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Validate Invite again (Just to be safe)
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('organization_invitations')
            .select('*')
            .eq('token', token)
            .single();

        if (inviteError || !invite || invite.is_used || new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
        }

        // 2. Check if user is already a member
        const { data: existingMember } = await supabaseAdmin
            .from('organization_members')
            .select('*')
            .eq('organization_id', invite.organization_id)
            .eq('user_id', userId)
            .single();

        if (existingMember) {
            return NextResponse.json({ message: 'Already a member' }); // Success, just redirect
        }

        // 3. Add to Members
        const { error: insertError } = await supabaseAdmin
            .from('organization_members')
            .insert([{
                organization_id: invite.organization_id,
                user_id: userId,
                role: invite.role,
                status: 'active'
            }]);

        if (insertError) throw insertError;

        // 4. Mark Invite as Used (optional - or keep reusable? Task said unique link usually implies single use, but for "Join Team" link usually reusable. 
        // Plan said: "Update organization_invitations (is_used=true)". So single use.
        // Wait, if I generate one link for "hiring manager team", maybe I want to reuse it?
        // The implementation plan says "Update is_used=true". I will follow the plan. 
        // If the user wants reusable links later, I can change logic.

        // Actually, for "Invite Member" usually it's 1-to-1 email. But here I made a "Copy Link" UI. 
        // If I copy a link and post it in Slack, I probably want multiple people to join.
        // BUT the DB schema has `is_used`.
        // I will follow the DB schema constraint for now (Single Use). 
        // -> I should probably update the UI to say "Single Use Link".

        const { error: updateError } = await supabaseAdmin
            .from('organization_invitations')
            .update({ is_used: true })
            .eq('id', invite.id);

        if (updateError) console.error('Failed to mark invite used:', updateError);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Accept Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
