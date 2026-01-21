
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Mail, Building2, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function InviteLandingPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const [invite, setInvite] = useState<any>(null);
    const [organization, setOrganization] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) checkInvite();
    }, [token]);

    const checkInvite = async () => {
        const supabase = createClient();

        // 1. Get Current User
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 2. Fetch Invite (Using anon key is tricky if no RLS allows public read of invite by token)
        // Note: RLS usually restricts Select. We should probably use a server component or an edge function for security.
        // For MVP, if we enabled "Members can view invitations", this assumes the user is ALREADY a member which is wrong.
        // We need a policy or a function to "get invite by token without auth" or "get org name by token".
        // Let's assume for now we can read if we have the token (Security by Obscurity for MVP or we add a text match policy).
        // Actually best practice: secure server function. But let's try direct query first.
        // Wait, RLS prevents reading invitations unless you are a member.
        // So public user CANNOT read this table.
        // Workaround: We will use a dedicated API endpoint `api/invite/[token]` which uses Service Role to validate and return Info.

        try {
            const response = await fetch(`/api/invite/validate?token=${token}`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '招待が見つかりません');
            }

            const data = await response.json();
            setInvite(data.invite);
            setOrganization(data.organization);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!currentUser) {
            // Redirect to Login/Register with return URL
            const returnUrl = encodeURIComponent(`/invite/${token}`);
            router.push(`/login?returnTo=${returnUrl}`); // Assuming login supports returnTo
            return;
        }

        setIsJoining(true);
        try {
            const response = await fetch('/api/invite/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: currentUser.id })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '参加に失敗しました');
            }

            toast.success(`${organization.name}に参加しました！`);
            router.push('/dashboard/company');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400">Loading Invitation...</div>;

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-xl font-black text-slate-800">無効な招待リンク</h1>
                    <p className="text-sm text-slate-500 font-bold">{error}</p>
                    <button onClick={() => router.push('/')} className="text-blue-600 font-black text-sm hover:underline">TOPへ戻る</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full space-y-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm transform -rotate-6">
                    <Building2 size={40} />
                </div>

                <div>
                    <p className="text-xs text-slate-400 font-black tracking-widest uppercase mb-2">INVITATION</p>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">
                        <span className="text-blue-600">{organization?.name}</span> に<br />参加しませんか？
                    </h1>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <Mail className="text-slate-400" size={16} />
                        招待ロール: {invite?.role === 'admin' ? '管理者' : 'メンバー'}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <UserPlus className="text-slate-400" size={16} />
                        有効期限: {new Date(invite?.expires_at).toLocaleDateString()}
                    </div>
                </div>

                <div className="space-y-3">
                    {currentUser ? (
                        <button
                            onClick={handleJoin}
                            disabled={isJoining}
                            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            {isJoining ? '処理中...' : 'チームに参加する'}
                            {!isJoining && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400 font-bold">参加するにはログインが必要です</p>
                            <button
                                onClick={handleJoin} // Will redirect
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all"
                            >
                                ログイン / 新規登録して参加
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
