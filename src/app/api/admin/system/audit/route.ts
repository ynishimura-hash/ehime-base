import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Use Service Role Key to bypass RLS for admin operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching audit logs (Admin API):', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (e: any) {
        console.error('Exception in audit logs API:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, action, tableName, recordId, description } = body;

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let targetUserId = userId;
        if (!targetUserId) {
            // Fetch any user ID to use for test log
            const { data: user } = await supabaseAdmin.from('profiles').select('id').limit(1).single();
            if (user) targetUserId = user.id;
        }

        const { error } = await supabaseAdmin.from('audit_logs').insert({
            user_id: targetUserId, // Must be valid profile ID
            action: action || 'create',
            table_name: tableName || 'test_table',
            record_id: recordId || '00000000-0000-0000-0000-000000000000',
            description: description || 'Manual test entry'
        });

        if (error) {
            console.error('Error creating test log:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
