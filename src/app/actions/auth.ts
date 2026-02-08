'use server';

import { createClient } from '@/utils/supabase/server';

export async function logoutAction() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return { success: true };
    } catch (error) {
        console.error('Logout Action Error:', error);
        return { success: false, error };
    }
}
