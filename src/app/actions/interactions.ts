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
            .match({ type, from_id: fromId, to_id: toId })
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
                    from_id: fromId,
                    to_id: toId,
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
            .eq('from_id', userId);

        // Filter based on what constitutes a "quest", "job", "company" like
        // Note: The UI separates them by 'like_job' (which covers quests and jobs) and 'like_company'.
        // However, distinction between quest and job relies on the `job` table data, not just the interaction type.
        // But for 'reset', we can rely on the interaction types if possible, OR we have to rely on the passed types.

        // The stored interaction types are usually: 'like_company', 'like_job', 'apply', 'scout', 'like_quest' (if distinct)
        // Looking at appStore types: type: 'like_company' | 'like_job' | 'like_user' | 'apply' | 'scout' | 'like_quest';

        // If the user wants to reset "Quests", we need to delete 'like_job' (or 'like_quest' if used) where the job is a quest.
        // This is complex to do swiftly in one delete without a join.
        // Ideally, we just delete by interaction type.

        // Let's refine based on the store's usage.
        // SavedPage uses:
        // Quests: isLiked('like_job', job.id) && job.type === 'quest'
        // Jobs: isLiked('like_job', job.id) && job.type === 'job'
        // Companies: isLiked('like_company', company.id)

        // To safely delete ONLY quests on the server side, we'd need to join with jobs table.
        // Or, we pass the List of IDs to delete from the client?
        // Passing IDs is safer and more precise given the client already knows which IDs belong to which category.

        // Actually, let's change the strategy for the Action to take a list of IDs to delete, or specific Types.
        // However, "Reset All" is easy.

        // If targetType is provided, we might need a different approach. 
        // But to keep it simple and robust:
        // If we want to delete "Quests", the client filters the Saved Quests list, gets their Interaction IDs (or simply from/to/type tuples), and sends them?
        // No, that's too much data transfer.

        // Strategy:
        // 1. Reset Company: Delete where from_id=user AND type='like_company'
        // 2. Reset All Jobs/Quests: Delete where from_id=user AND type='like_job' (This wipes both... separating them is tricky without Join)

        // Wait, if the user specifically asked for "Reset Quests" vs "Reset Jobs", but they share 'like_job' type...
        // We MUST verify if 'like_quest' is used.
        // In saved/page.tsx: isLiked('like_job', job.id) is used for BOTH.
        // So they share the same interaction type.

        // To support separate reset, we need to do a server-side join delete or fetch-then-delete.
        // Let's do fetch-then-delete for precision.

        if (targetType === 'company') {
            await query.eq('type', 'like_company');
        } else if (targetType === 'job' || targetType === 'quest') {
            // We need to filter 'like_job' interactions where the related job.type matches targetType
            // Supabase delete with inner join is tricky.
            // Alternative: Select IDs first.
            const { data: interactions } = await supabase
                .from('interactions')
                .select('id, to_id')
                .eq('from_id', userId)
                .in('type', ['like_job', 'like_quest']); // Cover bases

            if (!interactions) return { success: true };

            const jobIds = interactions.map(i => i.to_id);
            if (jobIds.length === 0) return { success: true };

            const { data: jobs } = await supabase
                .from('jobs')
                .select('id, type')
                .in('id', jobIds)
                .eq('type', targetType); // 'job' or 'quest'

            if (!jobs || jobs.length === 0) return { success: true };

            const targetJobIds = jobs.map(j => j.id);

            // Delete interactions pointing to these jobs
            const { error: delError } = await supabase
                .from('interactions')
                .delete()
                .eq('from_id', userId)
                .in('to_id', targetJobIds)
                .in('type', ['like_job', 'like_quest']); // Ensure type match too

            if (delError) throw delError;
            return { success: true };
        } else {
            // Reset ALL (All Saved/Likes)
            // Includes companies, jobs, quests
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
            .eq('from_id', userId);

        if (error) throw error;

        // Map to store Interaction format
        return {
            success: true,
            data: data.map(d => ({
                id: d.id, // Ensure ID is part of Interaction interface if stored
                type: d.type,
                fromId: d.from_id,
                toId: d.to_id,
                timestamp: new Date(d.timestamp).getTime(),
                metadata: d.metadata
            }))
        };
    } catch (error) {
        console.error('Error fetching interactions:', error);
        return { success: false, error };
    }
}
