"use client";

import React from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Users, Building2, Briefcase, GraduationCap,
    TrendingUp, ShieldCheck, Settings, Bell,
    Search, ArrowUpRight, BarChart3, Clock, Star, Database
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchAdminStats, fetchRecentInteractionsAction } from './actions';
import { createClient } from '@/utils/supabase/client';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { ALL_CONTENT } from '@/data/mock_elearning_data';

export default function AdminDashboardPage() {
    const { interactions, activeRole, courses, fetchCourses, users, currentUserId, systemSettings, fetchSystemSettings, updateSystemSetting } = useAppStore();
    const [counts, setCounts] = React.useState({ users: 0, companies: 0, jobs: 0, learning: 0 });
    const [recentInteractions, setRecentInteractions] = React.useState<any[]>([]);

    React.useEffect(() => {
        const validateSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
        };

        const fetchStats = async () => {
            // Use Server Action to fetch data securely (bypassing RLS)
            const stats = await fetchAdminStats();
            const interactionsResult = await fetchRecentInteractionsAction();

            if (courses.length === 0) fetchCourses();

            setCounts({
                users: stats.users,
                companies: stats.companies,
                jobs: stats.jobs,
                learning: ALL_CONTENT.length || 0
            });

            if (interactionsResult.data) {
                setRecentInteractions(interactionsResult.data);
            }

            fetchSystemSettings();
        };
        fetchStats();
    }, [fetchCourses, courses.length, fetchSystemSettings]);

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
        { label: '登録ユーザー', value: counts.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: '提携企業', value: counts.companies, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: '公開求人', value: counts.jobs, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'eラーニング数', value: counts.learning, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="flex flex-col h-full">
            <header className="bg-white border-b border-slate-200 h-20 sticky top-0 z-30 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 flex-1 max-w-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="データ全体を検索..."
                        className="bg-transparent border-none font-bold text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
                    />
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
                            {activeRole === 'admin' ? 'AD' : (() => {
                                const u = users.find(u => u.id === currentUserId);
                                return (
                                    <img
                                        src={u?.image || getFallbackAvatarUrl(u?.id || '', u?.gender)}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.getAttribute('data-error-tried')) {
                                                target.setAttribute('data-error-tried', 'true');
                                                target.src = getFallbackAvatarUrl(u?.id || '', u?.gender);
                                            } else {
                                                target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u?.name || 'U') + '&background=random';
                                            }
                                        }}
                                    />
                                );
                            })()}
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
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/admin/audit"
                            className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <Database size={16} className="text-blue-500" /> 監査ログを確認
                        </Link>
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm font-bold text-sm text-slate-600">
                            <Clock size={16} className="text-blue-500" /> 最終更新: 2026/02/03 15:30
                        </div>
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
                                            stat.label === 'eラーニング数' ? '/admin/elearning' :
                                                '/admin'
                            }
                            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:scale-[1.02] hover:shadow-xl transition-all block"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                    <stat.icon size={24} />
                                </div>

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
                            {recentInteractions.length > 0 ? recentInteractions.slice(0, 5).map((interaction, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${interaction.type.includes('like') ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' :
                                        interaction.type === 'apply' ? 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white' :
                                            'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                                        }`}>
                                        {interaction.type.includes('like') ? <Star size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800 leading-snug">
                                            {interaction.type === 'apply' ? (
                                                <span><span className="text-blue-600">{interaction.fromName || 'ユーザー'}</span> が求人「{interaction.targetName}」に応募しました</span>
                                            ) : interaction.type === 'like_company' ? (
                                                <span><span className="text-rose-500">{interaction.fromName || 'ユーザー'}</span> が企業「{interaction.targetName}」をお気に入りに追加しました</span>
                                            ) : interaction.type === 'like_job' ? (
                                                <span><span className="text-rose-500">{interaction.fromName || 'ユーザー'}</span> が求人「{interaction.targetName}」をお気に入りに追加しました</span>
                                            ) : interaction.type === 'like_quest' ? (
                                                <span><span className="text-rose-500">{interaction.fromName || 'ユーザー'}</span> がクエスト「{interaction.targetName}」をお気に入りに追加しました</span>
                                            ) : interaction.type === 'like_reel' ? (
                                                <span><span className="text-rose-500">{interaction.fromName || 'ユーザー'}</span> が動画「{interaction.targetName}」をお気に入りに追加しました</span>
                                            ) : interaction.type === 'like_user' ? (
                                                <span><span className="text-emerald-600">{interaction.fromName || '企業'}</span> がユーザー「{interaction.targetName}」をお気に入りに追加しました</span>
                                            ) : interaction.type === 'scout' ? (
                                                <span><span className="text-emerald-600">{interaction.fromName || '企業'}</span> がユーザー「{interaction.targetName}」にスカウトを送信しました</span>
                                            ) : (
                                                <span>{interaction.type} action: {interaction.fromName} -&gt; {interaction.targetName}</span>
                                            )}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                                            {new Date(interaction.timestamp).toLocaleString('ja-JP')}
                                        </p>
                                    </div>
                                </div>
                            )) : (
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
                            <button
                                onClick={() => toast.info('システム設定の詳細ページは未実装です。下部のクイック設定をご利用ください。')}
                                className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 backdrop-blur-md"
                            >
                                <Settings size={20} /> システム設定へ
                            </button>
                        </div>
                    </section>
                </div >

                {/* Quick Settings Section */}
                <section className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10 mt-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Database className="text-blue-600" />
                        <h3 className="text-2xl font-black text-slate-900">クイック設定</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <p className="font-black text-slate-800">トップページの統計データを実数連動させる</p>
                                <p className="text-sm font-bold text-slate-400 mt-1">
                                    ONにするとDBの実際のユーザー数・クエスト数を表示し、OFFでは固定値を表示します。
                                </p>
                            </div>
                            <button
                                onClick={() => updateSystemSetting('show_real_stats', !systemSettings['show_real_stats'])}
                                className={`w-14 h-8 rounded-full transition-all relative ${systemSettings['show_real_stats'] ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${systemSettings['show_real_stats'] ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>
            </div >
        </div >
    );
}
