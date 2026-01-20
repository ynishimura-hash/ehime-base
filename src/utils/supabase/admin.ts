import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error('Admin Client Init Error: Missing URL or Key', {
            hasUrl: !!url,
            hasKey: !!key
        });
        throw new Error(`Admin configuration missing. URL: ${!!url}, Key: ${!!key}`);
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
    )
}
