'use server';

import { createClient } from '@/utils/supabase/server';
import { Interaction } from '@/lib/appStore';
import { revalidatePath } from 'next/cache';

export async function toggleInteractionAction(
    type: Interaction['type'],
    fromId: string,
    toId: string,
    metadata?: any
) {
    const supabase = await createClient();

    try {
        // Check if exists
        const { data: existing } = await supabase
            .from('interactions')
            .select('id')
            .match({ type, user_id: fromId, target_id: toId })
            .single();

        if (existing) {
            // Delete
            const { error } = await supabase
                .from('interactions')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;
            return { success: true, action: 'removed' };
        } else {
            // Insert
            const { error } = await supabase
                .from('interactions')
                .insert({
                    type,
                    user_id: fromId,
                    target_id: toId,
                    metadata: metadata || {}
                });

            if (error) throw error;
            return { success: true, action: 'added' };
        }
    } catch (error: any) {
        console.error('Error toggling interaction:', error, { type, fromId, toId });
        return { success: false, error: error?.message || String(error) };
    }
}

export async function resetInteractionsAction(userId: string, targetType?: 'quest' | 'job' | 'company' | 'reel' | 'approach') {
    const supabase = await createClient();

    try {
        if (targetType === 'approach') {
            // Delete interactions where target is user (Scout, Like User)
            const { error } = await supabase
                .from('interactions')
                .delete()
                .eq('target_id', userId)
                .in('type', ['scout', 'like_user']);

            if (error) throw error;
            return { success: true };
        }

        // Following is logic for "My Actions" (user_id = me)
        let query = supabase
            .from('interactions')
            .delete()
            .eq('user_id', userId);

        if (targetType === 'company') {
            await query.eq('type', 'like_company');
        } else if (targetType === 'job' || targetType === 'quest') {
            // ... (Existing logic for job/quest filtering using joins is complex, simplifying if possible or keeping as is)
            // The previous logic for job/quest was fetching jobs first. Let's keep it but formatted cleanly.
            const { data: interactions } = await supabase
                .from('interactions')
                .select('id, target_id')
                .eq('user_id', userId)
                .in('type', ['like_job', 'like_quest']);

            if (!interactions || interactions.length === 0) return { success: true };

            const jobIds = interactions.map(i => i.target_id);
            // Fetch jobs to verify type
            const { data: jobs } = await supabase
                .from('jobs')
                .select('id, type')
                .in('id', jobIds)
                .eq('type', targetType); // 'job' or 'quest'

            if (!jobs || jobs.length === 0) return { success: true };

            const targetJobIds = jobs.map(j => j.id);

            // Re-query to delete specific ones
            const { error: delError } = await supabase
                .from('interactions')
                .delete()
                .eq('user_id', userId)
                .in('target_id', targetJobIds)
                .in('type', ['like_job', 'like_quest']);

            if (delError) throw delError;
            return { success: true };

        } else if (targetType === 'reel') {
            await query.eq('type', 'like_reel');
        } else {
            // Reset ALL "My Actions" (Favorites)
            // approach is not included here because it is "Incoming"
            query = query.in('type', ['like_company', 'like_job', 'like_quest', 'like_reel']);
            const { error } = await query;
            if (error) throw error;
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error resetting interactions:', error);
        return { success: false, error: error?.message || String(error) };
    }
}

export async function fetchUserInteractionsAction(userId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        // Map to store Interaction format
        return {
            success: true,
            data: data.map(d => ({
                id: d.id,
                type: d.type,
                fromId: d.user_id,
                toId: d.target_id,
                timestamp: new Date(d.created_at).getTime(),
                metadata: d.metadata || {}
            }))
        };
    } catch (error: any) {
        console.error('Error fetching interactions:', error);
        return { success: false, error: error?.message || String(error) };
    }
}
export async function markInteractionAsReadAction(interactionId: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('interactions')
            .update({ is_read: true })
            .eq('id', interactionId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error marking interaction as read:', error);
        return { success: false, error: error?.message || String(error) };
    }
}
