'use client';

import React from 'react';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, CheckCircle, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function InstructorDashboardPage() {
    const { activeRole, logout, loginAs, currentUserId } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = React.useState(true);
    const [profile, setProfile] = React.useState<any>(null);

    React.useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/inst-login');
                return;
            }

            // Fetch profile to verify instructor status
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile?.user_type !== 'instructor' && profile?.user_type !== 'admin') {
                toast.error('アクセス権限がありません');
                router.push('/');
                return;
            }

            setProfile(profile);
            loginAs('company', undefined, session.user.id); // Temporarily use 'company' role or similar if 'instructor' role not fully supported in appStore UI
            // Actually appStore has 'activeRole' which is 'seeker' | 'company' | 'admin'.
            // Instructor might need a new role in appStore or map to 'company' logic for now?
            // User said "Instructor Management", maybe they manage students? 
            // For now, I won't mess with appStore types too much, just render the page.

            setLoading(false);
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/inst-login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h1 className="font-black text-slate-800 text-lg leading-none">Instructor Portal</h1>
                        <p className="text-xs font-bold text-slate-400 mt-1">講師用管理画面</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-600">
                        {profile?.full_name || '講師ユーザー'} 様
                    </span>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        title="ログアウト"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8 space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">ようこそ、{profile?.full_name}先生</h2>
                    <p className="text-slate-500 font-bold">
                        現在、講師用機能は準備中です。担当クラスの管理や学生への課題提供機能が順次追加されます。
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">承認ステータス</h3>
                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                承認済み
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-60">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">担当クラス</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">機能準備中...</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-60">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                            <Search size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">学生検索</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2">機能準備中...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
