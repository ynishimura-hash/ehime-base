'use server';

import { createClient } from '@supabase/supabase-js';
import { UserAnalysis } from '@/lib/types/analysis';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchUserAnalysisAction(userId: string) {
    if (!userId) return { success: false, error: 'User ID is required' };

    try {
        const { data, error } = await supabaseAdmin
            .from('user_analysis')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'No rows found'
            throw error;
        }

        return {
            success: true,
            data: data ? {
                diagnosisScores: data.diagnosis_scores,
                selectedValues: data.selected_values,
                publicValues: data.public_values,
                isFortuneIntegrated: data.is_fortune_integrated,
                fortune: {
                    traits: data.fortune_traits || []
                }
            } : null
        };
    } catch (error: any) {
        console.error('Error fetching analysis:', error);
        return { success: false, error: error.message };
    }
}

export async function saveUserAnalysisAction(userId: string, data: Partial<UserAnalysis>) {
    if (!userId) return { success: false, error: 'User ID is required' };

    try {
        const payload = {
            user_id: userId,
            diagnosis_scores: data.diagnosisScores,
            selected_values: data.selectedValues,
            public_values: data.publicValues,
            is_fortune_integrated: data.isFortuneIntegrated,
            fortune_traits: data.fortune?.traits,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
            .from('user_analysis')
            .upsert(payload);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error saving analysis:', error);
        return { success: false, error: error.message };
    }
}
