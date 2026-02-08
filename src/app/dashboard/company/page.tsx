"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Heart, Eye, MessageSquare, TrendingUp, Zap, Briefcase, BookOpen } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

import { fetchPublicCompanyDetailAction } from '@/app/admin/actions';
import { useState, useEffect } from 'react';

export default function CompanyDashboardOverview() {
    const { interactions, getCompanyChats, currentCompanyId } = useAppStore();
    const [viewCount, setViewCount] = useState<number>(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        if (!currentCompanyId) return;

        const fetchStats = async () => {
            try {
                const result = await fetchPublicCompanyDetailAction(currentCompanyId);
                if (result.success && result.data?.company) {
                    setViewCount(result.data.company.view_count || 0);
                }
            } catch (error) {
                console.error('Failed to fetch company stats:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, [currentCompanyId]);

    // Calculate Real Stats
    const likeCount = interactions.filter(i => i.type === 'like_company' && i.toId === currentCompanyId).length;
    const scoutCount = interactions.filter(i => i.type === 'scout' && i.fromId === currentCompanyId).length;
    const unreadMessages = getCompanyChats(currentCompanyId).reduce((acc, chat) => {
        return acc + chat.messages.filter(m => m.senderId !== currentCompanyId && !m.isRead).length;
    }, 0);

    const stats = [
        {
            label: '総閲覧数',
            value: isLoadingStats ? '...' : viewCount.toLocaleString(),
            change: 'Total Views',
            icon: Eye,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            href: `/companies/${currentCompanyId}`
        },
        {
            label: '気になる',
            value: likeCount.toString(),
            change: 'Real-time',
            icon: Heart,
            color: 'text-red-500',
            bg: 'bg-red-50',
            href: '/dashboard/company/scout?tab=liked'
        },
        {
            label: 'スカウト送信',
            value: scoutCount.toString(),
            change: 'Real-time',
            icon: Zap,
            color: 'text-yellow-600',
            bg: 'bg-yellow-50',
            href: '/dashboard/company/scout?tab=scouted'
        },
        {
            label: 'メッセージ',
            value: unreadMessages > 0 ? `未読 ${unreadMessages}` : '既読',
            change: 'Check now',
            icon: MessageSquare,
            color: 'text-green-500',
            bg: 'bg-green-50',
            href: '/dashboard/company/messages'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-slate-800">ダッシュボード</h2>
                <p className="text-slate-500 text-sm mt-1">現在の募集状況とパフォーマンス概要</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Link
                        key={i}
                        href={stat.href}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 md:h-40 hover:shadow-md hover:-translate-y-1 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold mb-1">{stat.label}</p>
                            <p className="text-2xl md:text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/company/jobs" className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                            <Briefcase size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">New</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">求人・クエスト管理</h3>
                    <p className="text-sm text-slate-500 font-medium">掲載中の求人の編集や<br />新規作成はこちら</p>
                </Link>

                <Link href="/dashboard/company/progress" className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Analytics</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">学習進捗管理</h3>
                    <p className="text-sm text-slate-500 font-medium">社員のe-ラーニング受講状況<br />と成長を可視化</p>
                </Link>

                <Link href="/admin/elearning" className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Courses</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 mb-1">講座管理</h3>
                    <p className="text-sm text-slate-500 font-medium">自社専用の講座や<br />研修用教材の管理</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Interactions Placeholder */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Users size={20} className="text-slate-400" />
                            最近のアクティビティ
                        </h3>
                    </div>
                    {interactions.length > 0 ? (
                        <div className="space-y-4">
                            {[...interactions].reverse().slice(0, 5).map((action, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                        {action.type === 'scout' ? '⚡️' : '❤️'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            {action.type === 'scout' ? 'スカウトを送信しました' : '「気になる」されました'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(action.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">まだアクティビティはありません</p>
                    )}
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap size={100} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div>
                            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/10">AI ADVISOR</span>
                            <h3 className="text-xl font-black mt-2">プロフィールの改善提案</h3>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            閲覧数が先週より12%増加していますが、応募率がやや横ばいです。「RJP（ぶっちゃけ情報）」をもう少し具体的に記述することで、ミスマッチを恐れない熱意ある層の反応率が上がると予測されます。
                        </p>
                        <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-sm hover:bg-eis-yellow transition-colors">
                            プロフィールをAI修正する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
