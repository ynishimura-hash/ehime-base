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
                    metadata: metadata || {},
                    timestamp: new Date().toISOString()
                });

            if (error) throw error;
            return { success: true, action: 'added' };
        }
    } catch (error) {
        console.error('Error toggling interaction:', error);
        return { success: false, error };
    }
}

export async function resetInteractionsAction(userId: string, targetType?: 'quest' | 'job' | 'company' | 'reel') {
    const supabase = await createClient();

    try {
        let query = supabase
            .from('interactions')
            .delete()
            .eq('user_id', userId);

        if (targetType === 'company') {
            await query.eq('type', 'like_company');
        } else if (targetType === 'job' || targetType === 'quest') {
            const { data: interactions } = await supabase
                .from('interactions')
                .select('id, target_id')
                .eq('user_id', userId)
                .in('type', ['like_job', 'like_quest']);

            if (!interactions) return { success: true };

            const jobIds = interactions.map(i => i.target_id);
            if (jobIds.length === 0) return { success: true };

            const { data: jobs } = await supabase
                .from('jobs')
                .select('id, type')
                .in('id', jobIds)
                .eq('type', targetType);

            if (!jobs || jobs.length === 0) return { success: true };

            const targetJobIds = jobs.map(j => j.id);

            const { error: delError } = await supabase
                .from('interactions')
                .delete()
                .eq('user_id', userId)
                .in('target_id', targetJobIds)
                .in('type', ['like_job', 'like_quest']);

            if (delError) throw delError;
            return { success: true };
        } else {
            query = query.in('type', ['like_company', 'like_job', 'like_quest']);
            const { error } = await query;
            if (error) throw error;
        }

        return { success: true };

    } catch (error) {
        console.error('Error resetting interactions:', error);
        return { success: false, error };
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
    } catch (error) {
        console.error('Error fetching interactions:', error);
        return { success: false, error };
    }
}
