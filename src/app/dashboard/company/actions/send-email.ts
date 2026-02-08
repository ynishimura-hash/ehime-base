
'use server'

import { resend } from '@/lib/resend';

interface SendResult {
    email: string;
    status: 'success' | 'error';
    message?: string;
}

export async function bulkSendInviteEmailAction(
    recipients: { email: string; fullName: string; password?: string }[]
): Promise<{ results: SendResult[], error?: string }> {
    if (!process.env.RESEND_API_KEY) {
        return {
            error: 'システムからのメール送信設定（RESEND_API_KEY）が行われていません。環境変数を設定してください。',
            results: []
        };
    }

    const results: SendResult[] = [];
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/login/company` : 'http://localhost:3000/login/company';

    // Parallel execution for better performance (with limit if necessary)
    await Promise.all(recipients.map(async (recipient) => {
        if (!recipient.password) return; // Skip if no password provided (e.g. already existed)

        try {
            const { error } = await resend.emails.send({
                from: 'Ehime Base <onboarding@resend.dev>', // Default testing domain
                to: [recipient.email],
                subject: '【Ehime Base】アカウント発行のお知らせ',
                html: `
                    <p>${recipient.fullName} 様</p>
                    <p>Ehime Baseのアカウントが発行されました。</p>
                    <p>以下の情報でログインしてください。</p>
                    <br/>
                    <p><strong>ログインURL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
                    <p><strong>メールアドレス:</strong> ${recipient.email}</p>
                    <p><strong>初期パスワード:</strong> ${recipient.password}</p>
                    <br/>
                    <p>※ログイン後、セキュリティのためパスワードを変更してください。</p>
                `,
            });

            if (error) {
                console.error('Email send error:', error);
                results.push({
                    email: recipient.email,
                    status: 'error',
                    message: `送信エラー: ${error.message} (Resendのテスト環境の場合、ToはVerified Addressのみ許可されます)`
                });
            } else {
                results.push({ email: recipient.email, status: 'success' });
            }
        } catch (e: any) {
            console.error('Email unexpected error:', e);
            results.push({ email: recipient.email, status: 'error', message: e.message });
        }
    }));

    return { results };
}
