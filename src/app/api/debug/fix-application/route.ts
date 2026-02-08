import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
    try {
        const supabase = createAdminClient();

        // Target Data
        const jobId = 'b0ee0000-0000-0000-0000-000000000003';
        const userId = 'd75d0d36-8510-4f90-866b-027bc00a59e8'; // From debug output
        const companyId = 'a0ee0000-0000-0000-0000-000000000003';

        console.log(`Debug Insert Application: Job=${jobId}, User=${userId}`);

        // 1. Check if Job exists
        const { data: job, error: jobError } = await supabase.from('jobs').select('id, organization_id').eq('id', jobId).single();
        if (jobError) return NextResponse.json({ error: 'Job not found', details: jobError });

        // 2. Check if User exists (in profiles) - Application usually links to profiles or auth.users
        // Let's check profiles
        const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('id', userId).single();
        // Note: if profile doesn't exist, FK usually fails.

        // 3. Try Insert
        const { data, error: insertError } = await supabase
            .from('applications')
            .insert({
                job_id: jobId,
                user_id: userId,
                organization_id: companyId,
                status: 'applied',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        return NextResponse.json({
            message: 'Attempted Insert',
            job,
            profile: profile || { error: profileError },
            result: { data, error: insertError }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
