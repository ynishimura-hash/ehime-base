'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Increment Company View Count
export async function incrementCompanyViewAction(companyId: string) {
    const supabase = await createClient();

    try {
        // Fetch current count first
        const { data: current, error: fetchError } = await supabase
            .from('organizations')
            .select('view_count')
            .eq('id', companyId)
            .single();

        if (fetchError) {
            console.error('Fetch view count failed:', fetchError);
            return { success: false, error: fetchError };
        }

        const newCount = (current?.view_count || 0) + 1;

        // Update count
        const { error: updateError } = await supabase
            .from('organizations')
            .update({ view_count: newCount })
            .eq('id', companyId);

        if (updateError) {
            console.error('Update view count failed:', updateError);
            return { success: false, error: updateError };
        }

        revalidatePath(`/companies/${companyId}`);
        return { success: true, count: newCount };
    } catch (error) {
        console.error('Increment view count failed:', error);
        return { success: false, error };
    }
}
