
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function createAdminClient() {
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
    });
}

async function createTestAccounts() {
    console.log('Starting Test Account Creation...');
    const supabase = createAdminClient();

    // 0. Cleanup Orphans
    try {
        console.log('Checking for orphaned profiles...');
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listError) throw listError;
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id');
        if (profilesError) throw profilesError;

        console.log('Existing Auth Users:', users.map(u => `${u.email} (${u.id})`));

        const userIds = new Set(users.map(u => u.id));
        const orphans = profiles.filter(p => !userIds.has(p.id));

        // Check for email collision in profiles directly if email column exists (optimistic try)
        try {
            // Try to see if profiles has email column
            const { data: collision, error: colError } = await supabase.from('profiles').select('*').eq('email', 'test_seeker@example.com');
            if (collision && collision.length > 0) {
                console.log('Found profile with colliding email (but maybe different ID?):', collision);
                // If ID matches a user, it's fine. If not, it's a zombie.
                // But wait, if ID is not in userIds, it should have been caught by orphans check?
                // Unless the orphan check (p.id) matched a user ID?
                // If collision[0].id is in userIds, then we found the user! But listUsers missed it?
                // No, listUsers is the source of userIds.
            }
        } catch (ignored) { }

        if (orphans.length > 0) {
            console.log(`Found ${orphans.length} orphaned profiles. Deleting...`);
            const orphanIds = orphans.map(p => p.id);
            const { error: deleteError } = await supabase.from('profiles').delete().in('id', orphanIds);
            if (deleteError) console.error('Failed to cleanup orphans:', deleteError);
            else console.log('Orphans deleted.');
        } else {
            console.log('No orphans found (by ID check).');
        }

        // Logic for Seeker Creation
        const existingSeeker = users.find(u => u.email === 'test_seeker@example.com');
        if (existingSeeker) {
            console.log('Found existing Seeker:', existingSeeker.id);
            // Update password
            console.log('Updating password...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(existingSeeker.id, {
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    full_name: 'Test Seeker',
                    user_type: 'student' // Fixed from 'seeker' to match DB constraint
                }
            });
            if (updateError) console.error('Update failed:', updateError.message);
            else console.log('Password updated.');
        } else {
            console.log('Creating Test Seeker...');
            // ... creation code
            const { data: seeker, error: seekerError } = await supabase.auth.admin.createUser({
                email: 'test_seeker@example.com',
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    full_name: 'Test Seeker',
                    user_type: 'student' // Fixed from 'seeker' to match DB constraint
                }
            });

            if (seekerError) {
                console.log('Seeker creation result:', seekerError.message);
            } else {
                console.log('Seeker created:', seeker.user.id);
                // Profile might be created by trigger, so upsert
                await supabase.from('profiles').upsert({
                    id: seeker.user.id,
                    full_name: 'Test Seeker',
                    user_type: 'student', // Fixed from 'seeker'
                });
            }
        }

    } catch (e: any) {
        console.error('Cleanup/Seeker Error:', e.message);
    }

    // 2. Create Test Company (test_company@example.com)
    try {
        console.log('Creating Test Company...');
        const { data: company, error: companyError } = await supabase.auth.admin.createUser({
            email: 'test_company@example.com',
            password: 'password123',
            email_confirm: true,
            user_metadata: {
                full_name: 'Test Company User',
                user_type: 'company'
            }
        });

        if (companyError) {
            console.log('Company creation result:', companyError.message);
        } else {
            console.log('Company created:', company.user.id);

            // Create Profile
            await supabase.from('profiles').upsert({
                id: company.user.id,
                full_name: 'Test Company User',
                user_type: 'company',
                company_name: 'Test Corp Inc.',
                bio: 'Official Test Company Account'
            });

            // Create Organization for this company
            // (Assuming 1-to-1 mapping or just linking user to org)
            // In this app, organization creation is separate, usually.
            // But for demo, let's create a new Org.

            const { data: org, error: orgError } = await supabase.from('organizations').insert({
                name: 'Test Corp Inc.',
                industry: 'Technology',
                location: 'Matsuyama',
                status: 'approved',
                owner_id: company.user.id,
                description: 'A test corporation for demo purposes.',
                email: 'test_company@example.com'
            }).select().single();

            if (org) {
                console.log('Organization created:', org.id);
                // Update profile with org id if necessary? 
                // It seems AuthContext derives companyId? 
                // Actually `useEffect` in AuthContext fetches `profiles` but app needs `currentCompanyId`.
                // Who sets `currentCompanyId`? `RoleSwitcher` set it to 'c_eis'.
                // Real auth needs to find the organization associated with the user.
                // We might need a table `organization_members` or `owner_id` in `organizations`.
                // I see `organizations` has `owner_id` in my insert above.
            }
        }
    } catch (e: any) {
        console.log('Company error:', e.message);
    }

    console.log('Done.');
}

createTestAccounts();
