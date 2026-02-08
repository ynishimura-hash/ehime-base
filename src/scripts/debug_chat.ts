
import { createClient } from '@/utils/supabase/client';

export async function testChatCreation() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('Not logged in');
        return;
    }

    console.log('Testing chat creation for user:', user.id);

    // Get a valid company ID first
    const { data: company } = await supabase.from('organizations').select('id').limit(1).single();

    if (!company) {
        console.error('No companies found to test with');
        return;
    }

    console.log('Found company:', company.id);

    try {
        const { data: chat, error } = await supabase.from('casual_chats').insert({
            company_id: company.id,
            user_id: user.id
        }).select().single();

        if (error) {
            console.error('INSERT FAILED:', error);
        } else {
            console.log('INSERT SUCCESS:', chat);
            // Cleanup
            await supabase.from('casual_chats').delete().eq('id', chat.id);
        }
    } catch (e) {
        console.error('EXCEPTION:', e);
    }
}
