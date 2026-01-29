import { NextResponse } from 'next/server'
// The client you created in Step 2
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/onboarding/seeker'

    if (code) {
        console.log('Auth Callback: Code received, exchanging for session...');
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('Auth Callback SUCCESS: Session established for', data.user?.email);
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            let redirectUrl = `${origin}${next}`
            if (!isLocalEnv && forwardedHost) {
                redirectUrl = `https://${forwardedHost}${next}`
            }

            console.log('Auth Callback REDIRECT:', redirectUrl);
            return NextResponse.redirect(redirectUrl)
        } else {
            console.error('Auth Callback ERROR: Exchange failed:', error);
            console.error('Auth Callback ERROR Message:', error.message);
            console.error('Auth Callback ERROR Stack:', error.stack);

            // Pass the error message to the client for debugging
            return NextResponse.redirect(`${origin}/login/seeker?error=auth_callback_error&message=${encodeURIComponent(error.message)}`)
        }
    } else {
        console.warn('Auth Callback: No code found in URL');
        return NextResponse.redirect(`${origin}/login/seeker?error=no_code`)
    }

    // Fallback? Should be unreachable if logic covers all paths
    return NextResponse.redirect(`${origin}/login/seeker?error=unknown_error`)
}
