import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
    try {
        const supabase = createAdminClient();

        // Fetch applications
        const { data: applications, error: appError } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch interactions (apply type)
        const { data: interactions, error: intError } = await supabase
            .from('interactions')
            .select('*')
            .eq('type', 'apply')
            .order('created_at', { ascending: false });

        // Fetch jobs to verify IDs
        const { data: jobs, error: jobError } = await supabase
            .from('jobs')
            .select('id, title, organization_id')
            .order('created_at', { ascending: false });

        // Fetch organizations to verify IDs
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .order('created_at', { ascending: false });

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                applications: applications || [],
                interactions: interactions || [],
                jobs: jobs || [],
                organizations: organizations || [],
                errors: {
                    applications: appError,
                    interactions: intError,
                    jobs: jobError,
                    organizations: orgError
                }
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
