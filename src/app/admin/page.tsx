"use client";

import React from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Users, Building2, Briefcase, GraduationCap,
    TrendingUp, ShieldCheck, Settings, Bell,
    Search, ArrowUpRight, BarChart3, Clock, Star
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { COMPANIES, JOBS } from '@/lib/dummyData';

export default function AdminDashboardPage() {
    const { interactions, activeRole, courses, fetchCourses, users, currentUserId } = useAppStore();
    const [counts, setCounts] = React.useState({ users: 0, companies: 0, jobs: 0, learning: 0 });

    React.useEffect(() => {
        const validateSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            // If we are admin but have no Supabase session, we are in a 'Fake Admin' state.
            // If the data fetching relies on RLS that requires authentication, this will fail.
            // However, if we simply want to allow 'admin123' access, we should probably allow it 
            // but ensure we don't get stuck.
            // But the user's issue is they can't logout. 
            // Let's ensure that if they are 'admin' and want to logout, the logout function works.
            // But here, let's try to detect if the state is corrupted.
            // actually, for 'admin123' login, we DO NOT have a supabase session. 
            // So this check would force logout every time!
            // That's bad if the design is intended to be 'Fake Admin'.

            // The real issue is the user is 'Stuck'.
            // Why is the logout button unresponsive? 
            // Maybe because `logout` calls `supabase.auth.signOut()` and if network is bad it hangs?
            // let's pass { scope: 'local' } to signOut to avoid network hang? 
        };
        // validateSession(); 

        const fetchStats = async () => {
            const supabase = createClient();

            const safeCount = async (table: string, fallback: number) => {
                try {
                    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

                    if (error) {
                        // Ignore AbortError
                        if (error.message?.includes('aborted') || error.message?.includes('AbortError')) {
                            return 0; // Wait for next fetch or treat as 0 temporarily
                        }
                        console.error(`Error counting ${table}:`, error);
                        return fallback;
                    }

                    // If count is null (shouldn't happen with count: 'exact'), fallback
                    if (count === null) return fallback;

                    // 0 is valid, do not fallback
                    return count;
                } catch (e) {
                    console.error(`Exception counting ${table}:`, e);
                    return fallback;
                }
            };

            const userCount = await safeCount('profiles', 0); // fallback to 0 instead of 8
            const orgCount = await safeCount('organizations', 0);
            const jobCount = await safeCount('jobs', 0);

            if (courses.length === 0) fetchCourses();

            setCounts({
                users: userCount, // Allow 0
                companies: orgCount,
                jobs: jobCount,
                learning: courses.length || 0
            });
        };
        fetchStats();
    }, [fetchCourses, courses.length]);

    const [password, setPassword] = React.useState('');
    const { loginAs } = useAppStore();

    if (activeRole !== 'admin') {
        const handleAdminLogin = () => {
            // Simple dev-mode password check
            if (password === 'admin123') {
                loginAs('admin');
                toast.success('管理者としてログインしました');
            } else {
                toast.error('パスワードが間違っています');
            }
        };

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="bg-slate-900 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-slate-900/20">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Console</h1>
                        <p className="text-slate-500 font-bold mt-2">
                            システム管理者専用エリアです。
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <input
                            type="password"
                            placeholder="管理者パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                        />
                        <button
                            onClick={handleAdminLogin}
                            className="w-full bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                        >
                            認証する
                        </button>
                    </div>

                    <Link href="/" className="inline-block text-slate-400 font-bold text-sm hover:text-slate-600">
                        ← サイトに戻る
                    </Link>
                </div>
            </div>
        );
    }

    const stats = [
        { label: '登録ユーザー', value: counts.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Real' },
        { label: '提携企業', value: counts.companies, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Real' },
        { label: '公開求人', value: counts.jobs, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Real' },
        { label: 'eラーニング数', value: counts.learning, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Store' },
    ];

    return (
        <div className="flex flex-col h-full">
            <header className="bg-white border-b border-slate-200 h-20 sticky top-0 z-30 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 flex-1 max-w-md">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="データ全体を検索..." className="bg-transparent border-none font-bold text-sm outline-none w-full" />
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 leading-none">
                                {activeRole === 'admin' ? '管理者アカウント' : users.find(u => u.id === currentUserId)?.name || 'Guest User'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                                {activeRole === 'admin' ? 'System Operator' : activeRole}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs overflow-hidden">
                            {activeRole === 'admin' ? 'AD' : (
                                <img
                                    src={users.find(u => u.id === currentUserId)?.image || 'https://via.placeholder.com/40'}
                                    alt="Admin"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-8 overflow-y-auto flex-1">
                {/* Welcome Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Overview</h1>
                        <p className="text-slate-500 font-bold mt-1">システム全体のステータスを確認しましょう。</p>
                    </div>
                    <div className="hidden md:flex bg-white px-4 py-2 rounded-xl border border-slate-200 items-center gap-3 shadow-sm font-bold text-sm text-slate-600">
                        <Clock size={16} className="text-blue-500" /> 最終更新: 2026/01/18 15:30
                    </div>
                </div>

                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <Link
                            key={i}
                            href={
                                stat.label === '登録ユーザー' ? '/admin/management?tab=users' :
                                    stat.label === '提携企業' ? '/admin/management?tab=companies' :
                                        stat.label === '公開求人' ? '/admin/management?tab=jobs' :
                                            stat.label === 'eラーニング数' ? '/admin/management?tab=learning' :
                                                '/admin'
                            }
                            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:scale-[1.02] hover:shadow-xl transition-all block"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                    <stat.icon size={24} />
                                </div>
                                <span className="text-emerald-500 text-xs font-black bg-emerald-50 px-2 py-1 rounded-lg">
                                    {stat.trend}
                                </span>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</p>
                            </div>
                        </Link>
                    ))}
                </section>

                {/* Recent Activities Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <TrendingUp className="text-blue-600" /> アクティビティ
                            </h3>
                            <button className="text-sm font-black text-blue-600 hover:underline">すべて表示</button>
                        </div>
                        <div className="space-y-6">
                            {interactions.slice(-5).reverse().map((interaction, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${interaction.type.includes('like') ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' :
                                        interaction.type === 'apply' ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' :
                                            'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                                        }`}>
                                        {interaction.type.includes('like') ? <Star size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800">
                                            {interaction.type === 'apply' ? '新しい求人応募がありました' :
                                                interaction.type.includes('like') ? 'ユーザーが企業を「気になる」に追加しました' :
                                                    'スカウトメッセージが送信されました'}
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                            ID: {interaction.fromId.slice(0, 8)} → {interaction.toId.slice(0, 8)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400">
                                            {new Date(interaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {interactions.length === 0 && (
                                <div className="py-20 text-center text-slate-400 font-bold">
                                    アクティビティはまだありません
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-white relative overflow-hidden">
                        <div className="absolute right-[-20%] top-[-10%] text-white/5 -rotate-12">
                            <Settings size={300} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tight">System Settings</h3>
                                <p className="text-slate-400 font-bold mt-4 leading-relaxed">
                                    メンテナンスモードの切り替えや、システム全体の環境設定を行います。定期的なバックアップとデータ整合性の確認を推奨します。
                                </p>
                            </div>
                            <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md">
                                <Settings size={20} /> システム設定へ
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
