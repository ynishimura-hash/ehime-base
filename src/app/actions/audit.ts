'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAuditLogAction(data: {
    userId: string;
    action: 'create' | 'update' | 'delete' | 'restore' | 'approve' | 'reject';
    tableName: string;
    recordId: string;
    oldData?: any;
    newData?: any;
    description?: string;
}) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: data.userId,
                action: data.action,
                table_name: data.tableName,
                record_id: data.recordId,
                old_data: data.oldData,
                new_data: data.newData,
                description: data.description
            });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Error creating audit log:', error);
        return { success: false, error: error?.message || String(error) };
    }
}

/**
 * 汎用的な論理削除（ソフトデリート）アクション
 */
export async function softDeleteAction(tableName: string, recordId: string, userId: string) {
    const supabase = await createClient();

    try {
        // 現在のデータを取得（ログ用）
        const { data: oldData, error: fetchError } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', recordId)
            .single();

        if (fetchError) throw fetchError;

        // 論理削除の実行
        const { error: updateError } = await supabase
            .from(tableName)
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: userId
            })
            .eq('id', recordId);

        if (updateError) throw updateError;

        // 監査ログに記録
        await createAuditLogAction({
            userId,
            action: 'delete',
            tableName,
            recordId,
            oldData,
            description: `${tableName}のデータを論理削除しました`
        });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error(`Error soft deleting from ${tableName}:`, error);
        return { success: false, error: error?.message || String(error) };
    }
}
