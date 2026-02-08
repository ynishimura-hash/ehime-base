
'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

interface BulkCreateResult {
    email: string;
    password?: string;
    fullName: string;
    status: 'success' | 'error';
    message?: string;
}

export async function bulkCreateMembersAction(companyId: string, formData: FormData): Promise<{ results: BulkCreateResult[], error?: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) return { error: 'ファイルがアップロードされていません', results: [] };

        const text = await file.text();
        // Split by newline and handle potential CR
        const rows = text.split(/\r?\n/).map(r => r.split(',')).filter(r => r.length >= 2);

        // Header check: skip if first row looks like header
        let startIndex = 0;
        // Check for common header terms in Japanese or English
        if (rows.length > 0 && (
            rows[0][0].includes('姓') || rows[0][0].toLowerCase().includes('last') ||
            rows[0][2].includes('メール') || rows[0][2].toLowerCase().includes('email')
        )) {
            startIndex = 1;
        }

        const results: BulkCreateResult[] = [];
        const supabase = createAdminClient();

        for (let i = startIndex; i < rows.length; i++) {
            const row = rows[i];
            // Format: 姓, 名, メールアドレス, 権限(opt)
            const lastName = row[0]?.trim();
            const firstName = row[1]?.trim();
            const email = row[2]?.trim();
            const roleInput = row[3]?.trim()?.toLowerCase();

            // Validate basic inputs
            if (!email || !lastName || !firstName) continue;

            const fullName = `${lastName} ${firstName}`;
            const role = (roleInput === 'admin' || roleInput === '管理者') ? 'admin' : 'member';

            // Generate random password (8 chars alphanumeric)
            const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2);

            try {
                // 1. Create User via Admin API
                const { data: userData, error: createError } = await supabase.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: fullName,
                        role: 'company' // Custom user metadata
                    }
                });

                if (createError) {
                    // Check if user already exists
                    if (createError.message.includes('already registered')) {
                        results.push({ email, fullName, status: 'error', message: '既に登録されているメールアドレスです' });
                    } else {
                        results.push({ email, fullName, status: 'error', message: createError.message });
                    }
                    continue;
                }

                if (!userData.user) {
                    results.push({ email, fullName, status: 'error', message: 'ユーザー作成に失敗しました' });
                    continue;
                }

                // 2. Update Profile & Set Type
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        user_type: 'company'
                    })
                    .eq('id', userData.user.id);

                if (profileError) {
                    console.error('Profile update warning:', profileError);
                }

                // 3. Add to Organization Members
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .insert({
                        organization_id: companyId,
                        user_id: userData.user.id,
                        role: role
                    });

                if (memberError) {
                    // Cleanup user if member addition fails? 
                    // Or just report error. Reporting error is safer for now.
                    results.push({ email, fullName, status: 'error', message: `組織への追加に失敗: ${memberError.message}` });
                } else {
                    results.push({ email, fullName, password, status: 'success' });
                }

            } catch (e: any) {
                console.error('Unexpected error during bulk create:', e);
                results.push({ email, fullName, status: 'error', message: e.message || '不明なエラー' });
            }
        }

        revalidatePath('/dashboard/company/members');
        return { results };

    } catch (e: any) {
        console.error('Bulk action error:', e);
        return { error: '処理中にエラーが発生しました', results: [] };
    }
}
