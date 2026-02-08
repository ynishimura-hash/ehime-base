import { NextResponse } from 'next/server';
import { assignJobToCompanyAction } from '@/app/admin/actions';

export async function GET() {
    try {
        // Job: 1日体験：レガシーシステム改修ワーク
        const jobId = 'b0ee0000-0000-0000-0000-000000000003';
        // Company: 松山テクノサービス
        const companyId = 'a0ee0000-0000-0000-0000-000000000003';

        console.log(`Fixing Job ${jobId} -> Company ${companyId}`);
        const result = await assignJobToCompanyAction(jobId, companyId);

        return NextResponse.json({
            message: 'Fix executed',
            result
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
