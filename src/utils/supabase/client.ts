import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    if (!client) {
        console.log('[Supabase Client] Creating new browser client...');
        client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    fetch: (url, options = {}) => {
                        // Disable Next.js cache to prevent AbortErrors
                        return fetch(url, {
                            ...options,
                            cache: 'no-store',
                        });
                    }
                }
            }
        );
        console.log('[Supabase Client] Client created successfully');
    }
    return client;
}
