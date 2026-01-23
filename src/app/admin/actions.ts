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
export async function fetchPublicQuestsAction() {
    try {
        console.log('fetchPublicQuestsAction: querying quests...');
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations!inner (
                    id, name, industry, location, is_premium,
                    cover_image_url, logo_color, category, logo_url
                )
            `)
            .eq('type', 'quest')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch reels for these quests and companies
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*');

        const dataWithReels = (data || []).map(quest => {
            const questReels = (allReels || []).filter(r => r.job_id === quest.id);
            const companyReels = (allReels || []).filter(r => r.organization_id === quest.organization?.id && !r.job_id);
            const reels = [...questReels, ...companyReels].map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || media.public_url,
                title: media.title || media.filename,
            }));

            return {
                ...quest,
                organization: quest.organization ? {
                    ...quest.organization,
                    reels: reels
                } : null
            };
        });

        console.log(`fetchPublicQuestsAction: SUCCESS, found ${data?.length} rows`);
        return { success: true, data: dataWithReels };
    } catch (error: any) {
        console.error('fetchPublicQuestsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchPublicCompaniesAction() {
    try {
        console.log('fetchPublicCompaniesAction: querying organizations...');
        const { data, error } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Fetch reels for these companies in one go to avoid N+1
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*')
            .is('job_id', null);

        const dataWithReels = (data || []).map(company => ({
            ...company,
            reels: (allReels || [])
                .filter(r => r.organization_id === company.id)
                .map(media => ({
                    id: media.id,
                    type: media.type || 'file',
                    url: media.public_url,
                    thumbnail: media.thumbnail_url || media.public_url,
                    title: media.title || media.filename,
                }))
        }));

        console.log(`fetchPublicCompaniesAction: SUCCESS, found ${data?.length} rows`);
        return { success: true, data: dataWithReels };
    } catch (error: any) {
        console.error('fetchPublicCompaniesAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchPublicJobsAction() {
    try {
        console.log('fetchPublicJobsAction: querying jobs...');
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations (
                    id, name, industry, location, is_premium,
                    cover_image_url, rjp_negatives, logo_url
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch reels for these jobs and companies in one go
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*');

        const dataWithReels = (data || []).map(job => {
            const jobReels = (allReels || []).filter(r => r.job_id === job.id);
            const companyReels = (allReels || []).filter(r => r.organization_id === job.organization?.id && !r.job_id);
            const reels = [...jobReels, ...companyReels].map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || media.public_url,
                title: media.title || media.filename,
            }));

            return {
                ...job,
                organization: job.organization ? {
                    ...job.organization,
                    reels: reels
                } : null
            };
        });

        console.log(`fetchPublicJobsAction: SUCCESS, found ${data?.length} rows`);
        return { success: true, data: dataWithReels };
    } catch (error: any) {
        console.error('fetchPublicJobsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchPublicReelsAction() {
    try {
        console.log('fetchPublicReelsAction: querying media_library...');
        const { data: mediaData, error: mediaError } = await supabaseAdmin
            .from('media_library')
            .select('*')
            .order('created_at', { ascending: false });

        if (mediaError) throw mediaError;

        const { data: orgsData } = await supabaseAdmin
            .from('organizations')
            .select('id, name, logo_url, location, industry, is_premium');

        const orgMap = new Map(orgsData?.map((o: any) => [o.id, o]) || []);

        const items = (mediaData || []).map((item: any) => {
            const org = item.organization_id ? orgMap.get(item.organization_id) : null;
            return {
                reel: {
                    id: item.id,
                    url: item.public_url,
                    title: item.title || item.filename || 'No Title',
                    caption: item.caption,
                    link_url: item.link_url,
                    link_text: item.link_text,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    type: item.type || 'file'
                },
                organization: org,
                entityName: org?.name || 'Ehime Base',
                entityId: item.organization_id || item.job_id || 'admin',
                type: item.organization_id ? 'company' : (item.job_id ? 'job' : 'company'),
                companyId: item.organization_id
            };
        });

        console.log(`fetchPublicReelsAction: SUCCESS, found ${items.length} items`);
        return { success: true, data: items };
    } catch (error: any) {
        console.error('fetchPublicReelsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}
