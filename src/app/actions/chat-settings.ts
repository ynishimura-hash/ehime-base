'use server';

import { createClient } from '@/utils/supabase/server';
import { ChatSettings } from '@/lib/appStore';

export async function fetchChatSettingsAction(userId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('chat_settings')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedSettings: ChatSettings[] = data.map(s => ({
            id: s.id,
            ownerId: s.user_id,
            chatId: s.chat_id,
            isPinned: s.is_pinned,
            isBlocked: s.is_blocked,
            isUnreadManual: s.is_unread_manual,
            priority: s.priority,
            alias: s.alias,
            memo: s.memo,
            updatedAt: new Date(s.updated_at).getTime()
        }));

        return { success: true, data: mappedSettings };
    } catch (error) {
        console.error('Error fetching chat settings:', error);
        return { success: false, error };
    }
}

export async function updateChatSettingsAction(userId: string, chatId: string, settings: Partial<ChatSettings>) {
    const supabase = await createClient();

    try {
        // Prepare snake_case payload
        const payload: any = {};
        if (settings.isPinned !== undefined) payload.is_pinned = settings.isPinned;
        if (settings.isBlocked !== undefined) payload.is_blocked = settings.isBlocked;
        if (settings.isUnreadManual !== undefined) payload.is_unread_manual = settings.isUnreadManual;
        if (settings.priority !== undefined) payload.priority = settings.priority;
        if (settings.alias !== undefined) payload.alias = settings.alias;
        if (settings.memo !== undefined) payload.memo = settings.memo;
        payload.updated_at = new Date().toISOString();

        // Upsert
        const { data, error } = await supabase
            .from('chat_settings')
            .upsert({
                user_id: userId,
                chat_id: chatId,
                ...payload
            }, { onConflict: 'user_id, chat_id' })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error updating chat settings:', error);
        return { success: false, error };
    }
}
