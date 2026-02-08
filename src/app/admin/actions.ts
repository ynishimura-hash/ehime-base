'use server';

import { createAdminClient } from '@/utils/supabase/admin';

// Helper to get client safely
const getSupabaseAdmin = () => createAdminClient();

export async function fetchAdminStats() {
    try {
        console.log('Fetching admin stats with Service Role...');
        const supabaseAdmin = getSupabaseAdmin();

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

export async function fetchRecentInteractionsAction() {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        // Fetch recent interactions
        const { data: interactions, error } = await supabaseAdmin
            .from('interactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20); // Increase limit slightly to ensure we have enough valid ones

        if (error) {
            console.error('Fetch Interactions Error:', error);
            return { success: false, data: [] };
        }

        if (!interactions || interactions.length === 0) {
            return { success: true, data: [] };
        }

        // Collect IDs for batch fetching
        const userIds = new Set<string>();
        const companyIds = new Set<string>();
        const jobIds = new Set<string>();
        const mediaIds = new Set<string>();

        interactions.forEach((i: any) => {
            // Source (From)
            // Usually From is User, but for Scout it might be Company? 
            // Checking interaction types:
            // 'like_company', 'like_job', 'like_quest', 'like_reel', 'apply' -> From: User
            // 'scout' -> From: Company (usually), To: User
            // 'like_user' -> From: Company, To: User

            if (i.type === 'scout') {
                // Scout: From Company (usually) -> To User
                // Check if user_id is company or user acting as company rep
                // For now, try to resolve as Company first, then User
                if (i.user_id) {
                    companyIds.add(i.user_id);
                    userIds.add(i.user_id); // Fallback lookup
                }
            } else if (i.type === 'like_user') {
                // Like User: Company likes User
                if (i.user_id) {
                    companyIds.add(i.user_id);
                    userIds.add(i.user_id);
                }
            } else {
                // Normal user action
                if (i.user_id) userIds.add(i.user_id);
            }

            // Target (To)
            if (i.target_id) {
                if (i.type === 'like_company') companyIds.add(i.target_id);
                else if (i.type === 'like_job' || i.type === 'apply' || i.type === 'like_quest') jobIds.add(i.target_id);
                else if (i.type === 'like_reel') mediaIds.add(i.target_id);
                else if (i.type === 'scout' || i.type === 'like_user') userIds.add(i.target_id);
            }
        });

        // Batch Fetch
        const [usersRes, companiesRes, jobsRes, mediaRes] = await Promise.all([
            userIds.size > 0 ? supabaseAdmin.from('profiles').select('id, full_name, user_type').in('id', Array.from(userIds)) : { data: [] },
            companyIds.size > 0 ? supabaseAdmin.from('organizations').select('id, name').in('id', Array.from(companyIds)) : { data: [] },
            jobIds.size > 0 ? supabaseAdmin.from('jobs').select('id, title').in('id', Array.from(jobIds)) : { data: [] },
            mediaIds.size > 0 ? supabaseAdmin.from('media_library').select('id, title').in('id', Array.from(mediaIds)) : { data: [] }
        ]);

        const userMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]));
        const companyMap = new Map((companiesRes.data || []).map((c: any) => [c.id, c]));
        const jobMap = new Map((jobsRes.data || []).map((j: any) => [j.id, j]));
        const mediaMap = new Map((mediaRes.data || []).map((m: any) => [m.id, m]));

        const formatted = interactions.map((i: any) => {
            let fromName = '不明なユーザー';
            let targetName = '不明な対象';
            let fromType = 'user';

            // Resolve Actor (From)
            // If it's a recruiter acting, we might want their name OR company name if possible?
            // For simplicity, use profile name.
            if (userMap.has(i.user_id)) {
                fromName = userMap.get(i.user_id).full_name;
                fromType = userMap.get(i.user_id).user_type;
            } else if (companyMap.has(i.user_id)) {
                fromName = companyMap.get(i.user_id).name;
                fromType = 'company';
            }

            // Resolve Target
            if (i.type === 'like_company') {
                targetName = companyMap.get(i.target_id)?.name || '削除された企業';
            } else if (i.type === 'like_job' || i.type === 'apply' || i.type === 'like_quest') {
                targetName = jobMap.get(i.target_id)?.title || '削除された求人';
            } else if (i.type === 'like_reel') {
                targetName = mediaMap.get(i.target_id)?.title || '削除された動画';
            } else if (i.type === 'scout' || i.type === 'like_user') {
                targetName = userMap.get(i.target_id)?.full_name || '削除されたユーザー';
            }

            return {
                type: i.type,
                fromId: i.user_id,
                fromName,
                fromType,
                toId: i.target_id,
                targetName,
                timestamp: new Date(i.created_at).getTime(),
                metadata: i.metadata
            };
        });

        return { success: true, data: formatted };
    } catch (error) {
        console.error('fetchRecentInteractionsAction Error:', error);
        return { success: false, data: [] };
    }
}

export async function fetchQuestsAction() {
    try {
        console.log('Fetching quests with Service Role...');
        const supabaseAdmin = getSupabaseAdmin();
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

        // Fetch reels for these quests
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*');

        // Fetch application counts from interactions table
        const { data: applyInteractions } = await supabaseAdmin
            .from('interactions')
            .select('target_id')
            .eq('type', 'apply');

        const interactionCounts = (applyInteractions || []).reduce((acc: any, curr: any) => {
            acc[curr.target_id] = (acc[curr.target_id] || 0) + 1;
            return acc;
        }, {});

        const dataWithReels = (data || []).map(quest => {
            const questReels = (allReels || []).filter(r => r.job_id === quest.id);
            const mappedReels = questReels.map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                title: media.title || media.filename,
                likes: 0,
                entityType: 'job'
            }));

            return {
                ...quest,
                applicationCount: interactionCounts[quest.id] || 0,
                reels: mappedReels,
                tags: quest.value_tags_ai || [] // Map AI tags to frontend tags
            };
        });

        return {
            success: true,
            data: dataWithReels
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
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations!inner (
                    id, name, industry, location, is_premium,
                    cover_image_url
                )
            `)
            .or('type.eq.job,type.eq.quest,type.eq.internship,type.is.null');

        if (error) {
            console.error('fetchJobsAction: DB Error', error);
            return { success: false, error: error.message || String(error), data: [] };
        }

        // Fetch reels for these jobs
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*');

        // Fetch application counts
        const { data: interactions } = await supabaseAdmin
            .from('interactions')
            .select('target_id')
            .eq('type', 'apply');

        const appCounts = (interactions || []).reduce((acc: any, curr: any) => {
            acc[curr.target_id] = (acc[curr.target_id] || 0) + 1;
            return acc;
        }, {});

        const dataWithReels = (data || []).map(job => {
            const jobReels = (allReels || []).filter(r => r.job_id === job.id);
            const mappedReels = jobReels.map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                title: media.title || media.filename,
                likes: 0,
                entityType: 'job'
            }));

            return {
                ...job,
                reels: mappedReels,
                applicationCount: appCounts[job.id] || 0,
                tags: job.value_tags_ai || [] // Map AI tags to frontend tags
            };
        });

        return {
            success: true,
            data: dataWithReels
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
        const supabaseAdmin = getSupabaseAdmin();
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
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch reels for these companies
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
                    thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                    title: media.title || media.filename,
                }))
        }));

        // Log types for debugging
        if (data) {
            const types = [...new Set(data.map(o => o.type))];
            console.log(`fetchAdminCompaniesAction: SUCCESS, found ${data.length} rows. Types: ${types.join(', ')}`);
        }

        return { success: true, data: dataWithReels };
    } catch (error: any) {
        console.error('fetchAdminCompaniesAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchAdminJobsAction() {
    try {
        console.log('fetchAdminJobsAction: querying jobs...');
        const supabaseAdmin = getSupabaseAdmin();
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
        const supabaseAdmin = getSupabaseAdmin();
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
        const supabaseAdmin = getSupabaseAdmin();
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
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('fetchPublicQuestsAction: DB Error', error);
            return { success: false, error: error.message || String(error), data: [] };
        }

        // Fetch application counts for these quests from interactions table
        const { data: appCounts } = await supabaseAdmin
            .from('interactions')
            .select('target_id')
            .eq('type', 'apply');

        // Count applications per job
        const countsByJob = (appCounts || []).reduce((acc: any, curr: any) => {
            acc[curr.target_id] = (acc[curr.target_id] || 0) + 1;
            return acc;
        }, {});

        // Fetch reels for these quests and companies
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*');

        const dataWithReels = (data || []).map(quest => {
            const questReels = (allReels || []).filter(r => r.job_id === quest.id);
            const companyReels = (allReels || []).filter(r => r.organization_id === quest.organization?.id && !r.job_id);

            const mappedQuestReels = questReels.map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                title: media.title || media.filename,
                likes: 0,
                entityType: 'quest'
            }));

            const mappedCompanyReels = companyReels.map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                title: media.title || media.filename,
                likes: 0,
                entityType: 'company'
            }));

            // Combine for backward compatibility or use specific ones
            // User requested strict separation, so we put quest reels on quest, company on company.

            return {
                ...quest,
                applicationCount: countsByJob[quest.id] || 0,
                tags: quest.value_tags_ai || [], // Map AI tags to frontend tags
                reels: mappedQuestReels,
                organization: quest.organization ? {
                    ...quest.organization,
                    reels: mappedCompanyReels
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
        const supabaseAdmin = getSupabaseAdmin();
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in Server Action environment!');
        }

        const { data, error } = await supabaseAdmin
            .from('organizations')
            .select('*')
            .eq('is_public', true)
            .order('name', { ascending: true });

        if (error) {
            console.error('fetchPublicCompaniesAction: DB Error', error);
            return { success: false, error: error.message || String(error), data: [] };
        }

        console.log(`fetchPublicCompaniesAction: Found ${data?.length} organizations.`);

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
                    thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                    title: media.title || media.filename,
                }))
        }));

        console.log(`fetchPublicCompaniesAction: SUCCESS, found ${data?.length} rows`);
        return { success: true, data: dataWithReels };
    } catch (error: any) {
        // Log more detailed error but return success: false to prevent overlay
        console.error('fetchPublicCompaniesAction: Caught Error', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function fetchPublicJobsAction() {
    try {
        console.log('fetchPublicJobsAction: querying jobs...');
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select(`
                *,
                organization:organizations (
                    id, name, industry, location, is_premium,
                    cover_image_url, logo_url, is_public
                )
            `)
            .eq('is_public', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('fetchPublicJobsAction: DB Error', error);
            return { success: false, error: error.message || String(error), data: [] };
        }

        // Fetch reels for these jobs and companies in one go
        const { data: allReels } = await supabaseAdmin
            .from('media_library')
            .select('*');

        const dataWithReels = (data || []).map(job => {
            const jobReels = (allReels || []).filter(r => r.job_id === job.id);
            const companyReels = (allReels || []).filter(r => r.organization_id === job.organization?.id && !r.job_id);

            const mappedJobReels = jobReels.map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                title: media.title || media.filename,
                likes: 0,
                entityType: 'job'
            }));

            const mappedCompanyReels = companyReels.map(media => ({
                id: media.id,
                type: media.type || 'file',
                url: media.public_url,
                thumbnail: media.thumbnail_url || (media.type === 'youtube' ? null : media.public_url),
                title: media.title || media.filename,
                likes: 0,
                entityType: 'company'
            }));

            return {
                ...job,
                tags: job.value_tags_ai || [], // Map AI tags to frontend tags
                reels: mappedJobReels,
                organization: job.organization ? {
                    ...job.organization,
                    reels: mappedCompanyReels
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
        const supabaseAdmin = getSupabaseAdmin();
        const { data: mediaData, error: mediaError } = await supabaseAdmin
            .from('media_library')
            .select('*')
            .order('created_at', { ascending: false });

        if (mediaError) throw mediaError;

        const { data: orgsData } = await supabaseAdmin
            .from('organizations')
            .select('id, name, logo_url, location, industry, is_premium, is_public')
            .eq('is_public', true);

        const orgMap = new Map(orgsData?.map((o: any) => [o.id, o]) || []);

        const { data: jobsData } = await supabaseAdmin
            .from('jobs')
            .select('id, type, is_public')
            .eq('is_public', true);

        const jobMap = new Map(jobsData?.map((j: any) => [j.id, j.type]) || []);

        const items = (mediaData || []).map((item: any) => {
            const org = item.organization_id ? orgMap.get(item.organization_id) : null;

            let type: 'company' | 'job' | 'quest' = 'company';
            if (item.job_id) {
                const jobType = jobMap.get(item.job_id);
                type = jobType === 'quest' ? 'quest' : 'job';
            } else {
                type = 'company';
            }

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
                    type: item.type || 'file',
                    entityType: type
                },
                organization: org,
                entityName: org?.name || 'Ehime Base',
                entityId: item.organization_id || item.job_id || 'admin',
                type: type,
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

export async function updateMediaAction(mediaItem: any) {
    try {
        console.log('updateMediaAction: updating media...', mediaItem.id);
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('media_library')
            .update({
                title: mediaItem.title,
                caption: mediaItem.caption,
                link_url: mediaItem.link_url,
                link_text: mediaItem.link_text,
                organization_id: mediaItem.organization_id,
                job_id: mediaItem.job_id
            })
            .eq('id', mediaItem.id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('updateMediaAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function fetchPublicCompanyDetailAction(id: string) {
    try {
        console.log('fetchPublicCompanyDetailAction: fetching company details for', id);
        const supabaseAdmin = getSupabaseAdmin();

        // 1. Fetch organization
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('*, view_count')
            .eq('id', id)
            .single();

        if (orgError) {
            console.error('fetchPublicCompanyDetailAction: Org Error', orgError);
            throw orgError;
        }

        // 2. Fetch Jobs
        const { data: jobs } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .eq('organization_id', id);

        // 3. Fetch Reels
        const { data: reels } = await supabaseAdmin
            .from('media_library')
            .select('*')
            .eq('organization_id', id);

        return {
            success: true,
            data: {
                company: org,
                jobs: jobs || [],
                reels: reels || []
            }
        };
    } catch (error: any) {
        console.error('fetchPublicCompanyDetailAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function fetchPublicJobDetailAction(id: string) {
    try {
        console.log('fetchPublicJobDetailAction: fetching job details for', id);
        const supabaseAdmin = getSupabaseAdmin();

        const { data: job, error: jobError } = await supabaseAdmin
            .from('jobs')
            .select('*, organization:organizations(*)')
            .eq('id', id)
            .single();

        if (jobError) throw jobError;

        // Fetch reels
        // Reels for this job OR this organization (if desired to show company reels on job page)
        // Usually we want job-specific first, falling back to company?
        // Query asks for OR, so we get both.
        const { data: reels } = await supabaseAdmin
            .from('media_library')
            .select('*')
            .or(`job_id.eq.${id},organization_id.eq.${job.organization_id}`);

        return {
            success: true,
            data: {
                job: job,
                company: job.organization, // Flatten for convenience
                reels: reels || []
            }
        };
    } catch (error: any) {
        console.error('fetchPublicJobDetailAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function fetchAdminOrganizationsAction(filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        console.log('fetchAdminOrganizationsAction: fetching...', filter);
        let query = supabaseAdmin
            .from('organizations')
            .select('id, name, status, created_at, representative_name, website_url')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('fetchAdminOrganizationsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function updateOrganizationStatusAction(id: string, status: 'approved' | 'rejected') {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('updateOrganizationStatusAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function syncCompanyApplicationsAction(companyId: string) {
    try {
        console.log('syncCompanyApplicationsAction: syncing for', companyId);
        const supabaseAdmin = getSupabaseAdmin();

        // 1. Get all jobs for this company
        const { data: myJobs, error: jobsError } = await supabaseAdmin
            .from('jobs')
            .select('id')
            .eq('organization_id', companyId);

        if (jobsError) throw jobsError;

        const myJobIds = (myJobs || []).map(j => j.id);
        if (myJobIds.length === 0) return { success: true, count: 0 };

        // 2. Get all 'apply' interactions for these jobs
        const { data: interactions, error: interactionsError } = await supabaseAdmin
            .from('interactions')
            .select('*')
            .eq('type', 'apply')
            .in('target_id', myJobIds);

        if (interactionsError) throw interactionsError;
        if (!interactions || interactions.length === 0) return { success: true, count: 0 };

        // 3. Get existing applications
        // Note: Check uniqueness by job_id + user_id
        const { data: existingApps, error: appsError } = await supabaseAdmin
            .from('applications')
            .select('job_id, user_id')
            .eq('organization_id', companyId); // Assuming organization_id is populated in applications

        if (appsError) throw appsError;

        const existingSet = new Set((existingApps || []).map(a => `${a.job_id}_${a.user_id}`));

        // 4. Find missing and insert
        // Deduplicate interactions first (keep latest or earliest doesn't matter much effectively, but let's take latest)
        // Interactions might have duplicates if user clicked apply multiple times
        const uniqueInteractions = new Map<string, any>();
        interactions.forEach(i => {
            const key = `${i.target_id}_${i.user_id}`;
            // If we want latest, we overwrite. If earliest, we check existence.
            // Let's overwrite to check latest date logic if needed, but simple exists is enough.
            if (!uniqueInteractions.has(key)) {
                uniqueInteractions.set(key, i);
            }
        });

        const missingApps: any[] = [];
        uniqueInteractions.forEach((i) => {
            if (!existingSet.has(`${i.target_id}_${i.user_id}`)) {
                missingApps.push({
                    job_id: i.target_id,
                    user_id: i.user_id,
                    organization_id: companyId,
                    status: 'applied',
                    created_at: i.created_at
                });
            }
        });

        if (missingApps.length > 0) {
            console.log(`syncCompanyApplicationsAction: Restoring ${missingApps.length} applications...`);
            const { error: insertError } = await supabaseAdmin
                .from('applications')
                .insert(missingApps);

            if (insertError) {
                console.error('syncCompanyApplicationsAction: Insert Error', insertError);
                // Return error to see it in logs/toast if possible, or just fail silently partial
                // If unique constraint fails despite our client-side dedup (race condition), we might want ignoreDuplicates
                // But for now, client-side dedup handles the main issue found in logs
                throw insertError;
            }
        }

        return { success: true, count: missingApps.length };

    } catch (error: any) {
        console.error('syncCompanyApplicationsAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function createApplicationAction(jobId: string, userId: string, organizationId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // Check if already exists
        const { data: existing, error: findError } = await supabaseAdmin
            .from('applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('user_id', userId)
            .maybeSingle();

        if (findError) {
            console.error('createApplicationAction: Find Error', findError);
            // Proceed to insert usually, or throw? If find fails, insert might fail too strictly speaking, 
            // but maybeSingle shouldn't error on "no rows". It errors on connection etc.
            // If it's a connection error, insert will likely fail too.
            throw findError;
        }

        if (existing) {
            return { success: true, id: existing.id, message: 'Already applied' };
        }

        const { data, error } = await supabaseAdmin
            .from('applications')
            .insert({
                job_id: jobId,
                user_id: userId,
                organization_id: organizationId,
                status: 'applied',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('createApplicationAction: Insert Error', error);
            throw error;
        }
        return { success: true, data };
    } catch (error: any) {
        console.error('createApplicationAction: ERROR', error);
        return { success: false, error: error.message };
    }
}

export async function assignJobToCompanyAction(jobId: string, companyId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('jobs')
            .update({ organization_id: companyId })
            .eq('id', jobId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('assignJobToCompanyAction: ERROR', error);
        return { success: false, error: error.message };
    }
}

export async function fetchInstructorsAction(filter: 'all' | 'pending' | 'approved' | 'rejected' = 'all') {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        console.log('fetchInstructorsAction: fetching...', filter);

        // Debug info
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing');
            return { success: false, error: 'Server configuration error: Missing Service Role Key' };
        }

        let query = supabaseAdmin
            .from('instructors')
            .select(`
                *,
                profiles:user_id (full_name, email, avatar_url)
            `)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase Query Error:', error);
            throw error;
        }

        return { success: true, data: data || [] };
    } catch (error: any) {
        console.error('fetchInstructorsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function updateInstructorStatusAction(id: string, status: 'approved' | 'rejected' | 'suspended') {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const updates: any = { status };
        if (status === 'approved') {
            updates.approved_at = new Date().toISOString();
        }

        const { error } = await supabaseAdmin
            .from('instructors')
            .update(updates)
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('updateInstructorStatusAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function toggleInstructorOfficialAction(id: string, currentVal: boolean) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('instructors')
            .update({ is_official: !currentVal })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('toggleInstructorOfficialAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}


export async function fetchAuditLogsAction(filters?: { tableName?: string, action?: string, startDate?: string, endDate?: string }) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        console.log('fetchAuditLogsAction: fetching interactions...', filters);

        // Base query on interactions
        let query = supabaseAdmin
            .from('interactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        // Map 'tableName' filter to interaction categories if roughly applicable,
        // or just ignore if it doesn't map well.
        // For 'action', we can map to interaction type.
        if (filters?.action) {
            // Check if the filter action matches interaction types roughly
            query = query.like('type', `%${filters.action}%`);
        }

        if (filters?.startDate) {
            query = query.gte('created_at', filters.startDate);
        }

        if (filters?.endDate) {
            // Include the whole end day by setting time to 23:59:59 if it's just a date,
            // but usually the frontend passes a full ISO string or we handle it here.
            // Assuming simplified date string YYYY-MM-DD, let's append end of day if needed
            // or rely on strict comparison if ISO.
            // Let's assume the frontend passes end of day or we use lte properly.
            query = query.lte('created_at', filters.endDate);
        }

        const { data: interactions, error } = await query;

        if (error) throw error;

        if (!interactions || interactions.length === 0) {
            return { success: true, data: [] };
        }

        // --- Data Enrichment Logic (Same as fetchRecentInteractionsAction) ---
        // Collect IDs for batch fetching
        const userIds = new Set<string>();
        const companyIds = new Set<string>();
        const jobIds = new Set<string>();
        const mediaIds = new Set<string>();

        interactions.forEach((i: any) => {
            // Source (From)
            if (i.type === 'scout') {
                if (i.user_id) {
                    companyIds.add(i.user_id);
                    userIds.add(i.user_id); // Fallback
                }
            } else if (i.type === 'like_user') {
                if (i.user_id) {
                    companyIds.add(i.user_id);
                    userIds.add(i.user_id);
                }
            } else {
                if (i.user_id) userIds.add(i.user_id);
            }

            // Target (To)
            if (i.target_id) {
                if (i.type === 'like_company') companyIds.add(i.target_id);
                else if (i.type === 'like_job' || i.type === 'apply' || i.type === 'like_quest') jobIds.add(i.target_id);
                else if (i.type === 'like_reel') mediaIds.add(i.target_id);
                else if (i.type === 'scout' || i.type === 'like_user') userIds.add(i.target_id);
            }
        });

        // Batch Fetch
        const [usersRes, companiesRes, jobsRes, mediaRes] = await Promise.all([
            userIds.size > 0 ? supabaseAdmin.from('profiles').select('id, full_name, user_type, email').in('id', Array.from(userIds)) : { data: [] },
            companyIds.size > 0 ? supabaseAdmin.from('organizations').select('id, name').in('id', Array.from(companyIds)) : { data: [] },
            jobIds.size > 0 ? supabaseAdmin.from('jobs').select('id, title').in('id', Array.from(jobIds)) : { data: [] },
            mediaIds.size > 0 ? supabaseAdmin.from('media_library').select('id, title').in('id', Array.from(mediaIds)) : { data: [] }
        ]);

        const userMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]));
        const companyMap = new Map((companiesRes.data || []).map((c: any) => [c.id, c]));
        const jobMap = new Map((jobsRes.data || []).map((j: any) => [j.id, j]));
        const mediaMap = new Map((mediaRes.data || []).map((m: any) => [m.id, m]));

        const formatted = interactions.map((i: any) => {
            let fromName = '不明なユーザー';
            let fromEmail = '';
            let targetName = '不明な対象';
            let fromType = 'user';

            // Resolve Actor (From)
            if (userMap.has(i.user_id)) {
                const u = userMap.get(i.user_id);
                fromName = u.full_name;
                fromEmail = u.email;
                fromType = u.user_type;
            } else if (companyMap.has(i.user_id)) {
                fromName = companyMap.get(i.user_id).name;
                fromType = 'company';
            }

            // Resolve Target
            if (i.type === 'like_company') {
                targetName = companyMap.get(i.target_id)?.name || '削除された企業';
            } else if (i.type === 'like_job' || i.type === 'apply' || i.type === 'like_quest') {
                targetName = jobMap.get(i.target_id)?.title || '削除された求人';
            } else if (i.type === 'like_reel') {
                targetName = mediaMap.get(i.target_id)?.title || '削除された動画';
            } else if (i.type === 'scout' || i.type === 'like_user') {
                targetName = userMap.get(i.target_id)?.full_name || '削除されたユーザー';
            }

            return {
                id: i.id,
                action: i.type, // Map type to action for compatibility
                table_name: 'interactions', // Dummy
                record_id: i.target_id,
                created_at: i.created_at,
                profiles: {
                    full_name: fromName,
                    email: fromEmail
                },
                description: `${fromName} が ${targetName} に対して ${i.type} を実行しました`,
                // Extra fields for clearer display
                fromName,
                targetName,
                rawType: i.type
            };
        });

        return { success: true, data: formatted };
    } catch (error: any) {
        console.error('fetchAuditLogsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function updateOrganizationVisibilityAction(id: string, isPublic: boolean) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('organizations')
            .update({ is_public: isPublic })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('updateOrganizationVisibilityAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateJobVisibilityAction(id: string, isPublic: boolean) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('jobs')
            .update({ is_public: isPublic })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('updateJobVisibilityAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

export async function updateJobHiringStatusAction(id: string, status: 'open' | 'closed') {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('jobs')
            .update({ hiring_status: status })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('updateJobHiringStatusAction: ERROR', error);
        return { success: false, error: error.message || String(error) };
    }
}

/**
 * Global System Settings
 */
export async function fetchSystemSettingsAction() {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('system_settings')
            .select('*');

        if (error) {
            // If table doesn't exist, log warning but don't cause a crash/hang
            console.warn('fetchSystemSettingsAction: DB Warning (likely table missing)', error.message);
            return { success: true, data: [] }; // Return empty data as success to let UI proceed with defaults
        }

        return { success: true, data };
    } catch (e: any) {
        console.error('fetchSystemSettingsAction: Caught Error', e);
        return { success: true, data: [] }; // Fallback to success with empty data
    }
}

export async function updateSystemSettingAction(key: string, value: any) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('system_settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });

        if (error) {
            console.error('updateSystemSettingAction: DB Error', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (e: any) {
        console.error('updateSystemSettingAction: Caught Error', e);
        return { success: false, error: e.message || String(e) };
    }
}

export async function fetchCompanyApplicationsAction(companyId: string) {
    try {
        console.log('fetchCompanyApplicationsAction: Fetching for', companyId);
        const supabaseAdmin = getSupabaseAdmin();

        // 1. Fetch applications
        const { data: applications, error } = await supabaseAdmin
            .from('applications')
            .select(`
                *,
                jobs (
                    title, 
                    organization_id, 
                    type, 
                    content, 
                    salary, 
                    working_hours, 
                    holidays, 
                    location, 
                    welfare, 
                    selection_process
                ),
                profiles (
                    full_name, 
                    email, 
                    avatar_url, 
                    user_type, 
                    gender, 
                    university, 
                    faculty,
                    bio,
                    skills,
                    qualifications,
                    desired_conditions,
                    work_history,
                    graduation_year
                )
            `)
            .eq('organization_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Fetch related interactions (Favorites & Memos) for these applications
        const appIds = (applications || []).map(a => a.id);
        let interactionsMap: Record<string, { is_favorite: boolean; internal_memo: string }> = {};

        if (appIds.length > 0) {
            const { data: interactions } = await supabaseAdmin
                .from('interactions')
                .select('*')
                .in('target_id', appIds)
                .in('type', ['company_favorite_app', 'company_memo_app']);

            (interactions || []).forEach((i: any) => {
                if (!interactionsMap[i.target_id]) {
                    interactionsMap[i.target_id] = { is_favorite: false, internal_memo: '' };
                }

                if (i.type === 'company_favorite_app') {
                    interactionsMap[i.target_id].is_favorite = true;
                } else if (i.type === 'company_memo_app') {
                    interactionsMap[i.target_id].internal_memo = i.metadata?.content || '';
                }
            });
        }

        // Merge data
        const mergedData = (applications || []).map(app => ({
            ...app,
            is_favorite: interactionsMap[app.id]?.is_favorite || false,
            internal_memo: interactionsMap[app.id]?.internal_memo || ''
        }));

        console.log(`fetchCompanyApplicationsAction: Found ${mergedData.length} applications`);
        return { success: true, data: mergedData };
    } catch (error: any) {
        console.error('fetchCompanyApplicationsAction: ERROR', error);
        return { success: false, error: error.message || String(error), data: [] };
    }
}

export async function updateApplicationStatusAction(appId: string, status: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('applications')
            .update({ status })
            .eq('id', appId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleApplicationFavoriteAction(appId: string, userId: string, isFavorite: boolean) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        if (isFavorite) {
            // Create favorite interaction
            // Ensure uniqueness: check if exists first? Or simple insert, but multiple favs?
            // Let's delete existing first to be safe, then insert.
            await supabaseAdmin.from('interactions').delete()
                .eq('target_id', appId)
                .eq('type', 'company_favorite_app');

            const { error } = await supabaseAdmin.from('interactions').insert({
                user_id: userId,
                target_id: appId,
                type: 'company_favorite_app',
                metadata: {}
            });
            if (error) throw error;
        } else {
            // Remove favorite
            const { error } = await supabaseAdmin.from('interactions').delete()
                .eq('target_id', appId)
                .eq('type', 'company_favorite_app');
            if (error) throw error;
        }

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateApplicationMemoAction(appId: string, userId: string, content: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // Check if memo exists
        const { data: existing } = await supabaseAdmin.from('interactions')
            .select('id')
            .eq('target_id', appId)
            .eq('type', 'company_memo_app')
            .single();

        let error;
        if (existing) {
            const { error: updateError } = await supabaseAdmin.from('interactions')
                .update({ metadata: { content } })
                .eq('id', existing.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabaseAdmin.from('interactions')
                .insert({
                    user_id: userId,
                    target_id: appId,
                    type: 'company_memo_app',
                    metadata: { content }
                });
            error = insertError;
        }

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
