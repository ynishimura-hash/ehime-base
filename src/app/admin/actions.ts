'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client with Service Role Key
// This client has full access to the database and bypasses RLS.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchAdminStats() {
    try {
        console.log('Fetching admin stats with Service Role...');

        // 1. Fetch Users Count
        const { count: userCount, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // 2. Fetch Companies Count
        const { count: companyCount, error: companyError } = await supabaseAdmin
            .from('organizations')
            .select('*', { count: 'exact', head: true });

        if (companyError) throw companyError;

        // 3. Fetch Jobs Count
        const { count: jobCount, error: jobError } = await supabaseAdmin
            .from('jobs')
            .select('*', { count: 'exact', head: true });

        if (jobError) throw jobError;

        // Return results (default to 0 if null, though count: 'exact' returns number)
        return {
            users: userCount || 0,
            companies: companyCount || 0,
            jobs: jobCount || 0,
            success: true
        };

    } catch (error) {
        console.error('Admin Fetch Error:', error);
        return {
            users: 0,
            companies: 0,
            jobs: 0,
            success: false,
            error: error
        };
    }
}

export async function fetchQuestsAction() {
    try {
        console.log('Fetching quests with Service Role...');
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations!inner (
                    id, name, industry, location, is_premium,
                    cover_image_url
                )
            `)
            .eq('type', 'quest');

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Fetch Quests Error:', error);
        return {
            success: false,
            error: error,
            data: []
        };
    }
}
export async function fetchJobsAction() {
    try {
        console.log('Fetching jobs with Service Role...');
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations!inner (
                    id, name, industry, location, is_premium,
                    cover_image_url
                )
            `)
            .or('type.eq.job,type.is.null');

        if (error) throw error;

        return {
            success: true,
            data: data || []
        };
    } catch (error) {
        console.error('Fetch Jobs Error:', error);
        return {
            success: false,
            error: error,
            data: []
        };
    }
}

export async function fetchAdminUsersAction() {
    try {
        console.log('fetchAdminUsersAction: querying profiles...');
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log(`fetchAdminUsersAction: SUCCESS, found ${data?.length} rows`);
        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('fetchAdminUsersAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchAdminCompaniesAction() {
    try {
        console.log('fetchAdminCompaniesAction: querying organizations...');
        const { data, error } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Log types for debugging
        if (data) {
            const types = [...new Set(data.map(o => o.type))];
            console.log(`fetchAdminCompaniesAction: SUCCESS, found ${data.length} rows. Types: ${types.join(', ')}`);
        }

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('fetchAdminCompaniesAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchAdminJobsAction() {
    try {
        console.log('fetchAdminJobsAction: querying jobs...');
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Log types for debugging
        if (data) {
            const types = [...new Set(data.map(j => j.type))];
            console.log(`fetchAdminJobsAction: SUCCESS, found ${data.length} rows. Types: ${types.join(', ')}`);
        }

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('fetchAdminJobsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchAdminMediaAction() {
    try {
        console.log('fetchAdminMediaAction: querying media_library...');
        const { data, error } = await supabaseAdmin
            .from('media_library')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log(`fetchAdminMediaAction: SUCCESS, found ${data?.length} rows`);
        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('fetchAdminMediaAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}
