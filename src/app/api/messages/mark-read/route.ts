import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { chatId, readerId } = await request.json();

        if (!chatId || !readerId) {
            return NextResponse.json({ error: 'Missing chatId or readerId' }, { status: 400 });
        }

        // Use Service Role Key to bypass RLS (since default RLS might block updates)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Update messages as read
        // Update messages in this chat that were NOT sent by the reader, and are currently unread
        const { error } = await supabaseAdmin
            .from('messages')
            .update({ is_read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', readerId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking messages as read (Admin):', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('Exception in mark-read API:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
