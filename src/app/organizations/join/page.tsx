"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { CheckCircle, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function JoinContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const { authStatus, users, currentUserId, companies, consumeInvitation } = useAppStore();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');

    // Mock: Get organization info from token (In reality, verify via API)
    const targetCompany = companies.find(c => c.id === 'c_eis'); // Mock logic

    useEffect(() => {
        if (!token) {
            setStatus('error');
        }
    }, [token]);

    const handleJoin = () => {
        if (!token || !currentUserId) return;

        setStatus('loading');
        // Simulate API delay
        setTimeout(async () => {
            const success = await consumeInvitation(token, currentUserId);
            if (success) {
                setStatus('success');
                toast.success('組織への参加が完了しました！');
                setTimeout(() => {
                    router.push('/dashboard/company'); // Redirect to dashboard
                }, 1500);
            } else {
                setStatus('error');
                toast.error('無効な招待トークンです');
            }
        }, 1000);
    };

    if (authStatus === 'guest') {
        return (
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building2 className="text-blue-600" size={40} />
                </div>
                <h1 className="text-2xl font-black text-slate-800 mb-4">{targetCompany?.name}へ招待されています</h1>
                <p className="text-slate-500 font-bold mb-8">
                    組織に参加するには、アカウントにログインするか<br />新規登録を行ってください。
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push(`/login?redirect=/organizations/join?token=${token}`)}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        ログインして参加
                    </button>
                    <button
                        onClick={() => router.push(`/welcome?redirect=/organizations/join?token=${token}`)}
                        className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                        新規登録
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center">
            {status === 'success' ? (
                <div className="animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h1 className="text-xl font-black text-slate-800 mb-2">参加完了！</h1>
                    <p className="text-slate-500 font-bold">ダッシュボードへ移動します...</p>
                </div>
            ) : status === 'error' ? (
                <div className="animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-red-600" size={40} />
                    </div>
                    <h1 className="text-xl font-black text-slate-800 mb-2">エラーが発生しました</h1>
                    <p className="text-slate-500 font-bold mb-6">招待リンクが無効か、期限切れです。</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-slate-100 text-slate-600 px-6 py-2 rounded-lg font-bold hover:bg-slate-200"
                    >
                        トップへ戻る
                    </button>
                </div>
            ) : (
                <div>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Building2 className="text-blue-600" size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">{targetCompany?.name}</h1>
                    <p className="text-slate-500 font-bold mb-8">
                        この組織にメンバーとして参加しますか？
                    </p>
                    <button
                        onClick={handleJoin}
                        disabled={status === 'loading'}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === 'loading' ? '処理中...' : '参加する'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function JoinOrganizationPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-slate-400" size={32} />
                    <p className="text-slate-500 font-bold">読み込み中...</p>
                </div>
            }>
                <JoinContent />
            </Suspense>
        </div>
    );
}

