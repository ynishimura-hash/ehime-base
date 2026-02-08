"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';
// import { JOBS, COMPANIES } from '@/lib/dummyData';
import {
    Zap, Briefcase, BookOpen, Target,
    Sparkles, MessageSquare, Heart, TrendingUp,
    ChevronRight, PlayCircle, Award, Layout,
    GraduationCap, Search, Bell, ArrowRight, ArrowLeft, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecommendations } from '@/lib/recommendation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { calculateCategoryRadarData } from '@/lib/analysisUtils';
import { VALUE_CARDS } from '@/lib/constants/analysisData';
import { createClient } from '@/utils/supabase/client';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { calculateProfileCompletion } from '@/lib/profileUtils';
import { getYoutubeId } from '@/utils/youtube';
import { DailyMissions } from '@/components/dashboard/DailyMissions';
import { DailyFortune } from '@/components/dashboard/DailyFortune';

export default function SeekerDashboard() {
    const {
        personaMode,
        setPersonaMode,
        currentUserId,
        users,
        userAnalysis,
        activeRole, // Add activeRole
        jobs,
        companies,
        courses,
        interactions,
        completedLessonIds,
        lastViewedLessonIds,
        getUserChats,
        authStatus,
        fetchCourses
    } = useAppStore();

    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Admin can view Seeker Dashboard (using Yuji's data as fallback if no profile)
    const currentUser = users.find(u => u.id === currentUserId) ||
        (activeRole === 'admin' ? users.find(u => u.id === '061fbf87-f36e-4612-80b4-dedc77b55d5e') : undefined);

    // Clear Legacy Dummy Data (Migration) - Disabled to allow manual seeding
    // useEffect(() => {
    //     if (userAnalysis.isFortuneIntegrated === undefined || (userAnalysis.isFortuneIntegrated && Object.keys(userAnalysis.diagnosisScores || {}).length > 0)) {
    //         console.log('Migrating legacy diagnosis data...');
    //         // useAppStore.getState().setAnalysisResults({ ... });
    //     }
    // }, [userAnalysis]);

    // 認証チェック
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                // セッション取得（サーバーへのリクエストを最小限に）
                const { data: { session }, error } = await supabase.auth.getSession();

                if (!isMounted) return;

                if (!session?.user) {
                    console.log('Dashboard: No session found, stopping loader.');
                    setIsCheckingAuth(false);
                    return;
                }

                // プロフィールチェック（必須ではないが念のため）
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (!isMounted) return;

                // ストアとの同期（必要な場合のみ）
                const currentStore = useAppStore.getState();
                if (currentStore.authStatus !== 'authenticated' || currentStore.currentUserId !== session.user.id) {
                    console.log('Syncing auth state in Dashboard:', session.user.id);
                    currentStore.loginAs('seeker', session.user.id);
                }

            } catch (error) {
                console.error('認証チェックエラー:', error);
            } finally {
                if (isMounted) {
                    setIsCheckingAuth(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [supabase]);

    // Debug: Listen for Auth Changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            console.log(`Dashboard Auth Event: ${event}`, session?.user?.id);
            if (event === 'SIGNED_OUT') {
                console.warn('Dashboard received SIGNED_OUT');
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    // usersが更新されたときにcurrentUserをチェック
    useEffect(() => {
        if (currentUser && isCheckingAuth) {
            setIsCheckingAuth(false);
        }
    }, [currentUser, isCheckingAuth]);

    // モジュール（コース）を直接取得
    const [modules, setModules] = useState<any[]>([]);
    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await fetch('/api/elearning/modules');
                if (res.ok) {
                    const data = await res.json();
                    // Ensure uniqueness by ID
                    const uniqueModules = Array.from(new Map(data.map((m: any) => [m.id, m])).values());
                    setModules(uniqueModules);
                }
            } catch (error) {
                console.error('Failed to fetch modules:', error);
            }
        };
        if (modules.length === 0) {
            fetchModules();
        }
    }, [modules.length]);

    // Debug: Check userAnalysis on mount/update
    useEffect(() => {
        console.log('Dashboard: userAnalysis:', userAnalysis);
        console.log('Dashboard: dayMaster:', userAnalysis?.fortune?.dayMaster);
    }, [userAnalysis]);

    // Restore Deleted Logic:
    const userChats = getUserChats(currentUserId);
    const unreadCount = userChats.reduce((acc, chat) => acc + chat.messages.filter(m => !m.isRead && m.senderId !== currentUserId).length, 0);

    // Recommendations
    // Recommendations
    const { jobs: recommendedJobs } = useMemo(() =>
        getRecommendations(userAnalysis, jobs, courses, companies),
        [userAnalysis, courses, jobs, companies]);

    // Fix: Fallback to all jobs if recommendations don't contain enough of a specific type
    let activeQuests = recommendedJobs.filter(j => j.type === 'quest').slice(0, 2);
    if (activeQuests.length === 0) {
        activeQuests = jobs.filter(j => j.type === 'quest').slice(0, 2);
    }
    // Ensure uniqueness for activeQuests
    activeQuests = Array.from(new Map(activeQuests.map(item => [item.id, item])).values());

    let activeJobs = recommendedJobs.filter(j => j.type === 'job').slice(0, 4);
    if (activeJobs.length === 0) {
        activeJobs = jobs.filter(j => j.type === 'job').slice(0, 4);
    }
    // Ensure uniqueness for activeJobs
    activeJobs = Array.from(new Map(activeJobs.map(item => [item.id, item])).values());

    // Profile Completion Calculation
    const profileCompletion = calculateProfileCompletion(currentUser);

    // Radar Data
    const hasDiagnosis = Object.keys(userAnalysis.diagnosisScores || {}).length > 0;

    // Daily Missions Logic
    const missions = [
        {
            id: 'login',
            label: 'ログインする',
            isCompleted: true,
            link: undefined
        },
        {
            id: 'profile',
            label: 'プロフィールを80%以上にする',
            isCompleted: profileCompletion >= 80,
            link: '/mypage/edit'
        },
        {
            id: 'interaction',
            label: '気になる求人を1つ見つける',
            isCompleted: interactions.some(i => i.type.startsWith('like') && i.timestamp > new Date().setHours(0, 0, 0, 0)),
            link: '/jobs'
        }
    ];

    const radarData = calculateCategoryRadarData(userAnalysis.diagnosisScores || {});

    // Learning Progress
    const allLessons = courses.flatMap(c => (c.curriculums || []).flatMap(curr => curr.lessons));
    const overallProgress = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0;

    const recentlyViewedLessons = Array.from(new Set(lastViewedLessonIds)).map(id =>
        allLessons.find(l => l.id === id)
    ).filter(Boolean);

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400 font-bold">プロフィールを読み込み中...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <Lock size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-slate-800">ログインが必要です</h2>
                        <p className="text-sm font-bold text-slate-500 leading-relaxed">
                            セッションの有効期限が切れているか、<br />
                            正常に接続できていない可能性があります。
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href="/login/seeker"
                            className="bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                        >
                            ログイン画面へ
                        </Link>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                        >
                            再試行する
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Top Bar */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/mypage" className="relative group flex-shrink-0">
                            <img
                                src={currentUser.image || getFallbackAvatarUrl(currentUser.id, currentUser.gender)}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all opacity-100 group-hover:opacity-80"
                                alt=""
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.getAttribute('data-error-tried')) {
                                        target.setAttribute('data-error-tried', 'true');
                                        target.src = getFallbackAvatarUrl(currentUser.id, currentUser.gender);
                                    } else {
                                        // Final fallback if Dicebear also fails
                                        target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name || 'U') + '&background=random';
                                    }
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Search size={12} className="text-white drop-shadow-md" />
                            </div>
                        </Link>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ホーム</p>
                            <h1 className="text-sm font-black text-slate-800">こんにちは、{currentUser.name}さん</h1>
                        </div>
                    </div>

                    {/* Persona Toggle */}
                    <div className="bg-slate-100 p-1 rounded-full flex gap-1 shadow-inner border border-slate-200">
                        <button
                            onClick={() => setPersonaMode('seeker')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all flex items-center gap-1.5 ${personaMode === 'seeker' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Target size={14} /> 求職者モード
                        </button>
                        <button
                            onClick={() => setPersonaMode('reskill')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all flex items-center gap-1.5 ${personaMode === 'reskill' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <GraduationCap size={14} /> 受講生モード
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    {personaMode === 'seeker' ? (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                <Link href="/saved" className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <Heart size={20} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">気になる</p>
                                    <p className="text-xl font-black text-slate-800 leading-none">
                                        {interactions.filter(i => (i.type === 'like_job' || i.type === 'like_quest' || i.type === 'like_company' || i.type === 'like_reel') && i.fromId === currentUserId).length}
                                    </p>
                                </Link>
                                <Link href="/dashboard/interactions" className="bg-white p-4 rounded-3xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md transition-shadow group text-center relative overflow-hidden">
                                    <div className="absolute -right-2 -top-2 w-12 h-12 bg-blue-100/50 rounded-full blur-xl"></div>
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform relative z-10">
                                        <Sparkles size={20} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest leading-none mb-1 relative z-10">企業から興味</p>
                                    <p className="text-xl font-black text-slate-800 leading-none relative z-10">
                                        {interactions.filter(i => (i.type === 'like_user' || i.type === 'scout') && i.toId === currentUserId).length}
                                    </p>
                                </Link>
                                <Link href="/progress" className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">応募中</p>
                                    <p className="text-xl font-black text-slate-800 leading-none">
                                        {interactions.filter(i => i.type === 'apply' && i.fromId === currentUserId).length}
                                    </p>
                                </Link>
                                <Link href="/messages" className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center relative">
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full animate-pulse z-20">
                                            {unreadCount}
                                        </span>
                                    )}
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <MessageSquare size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">メッセージ</p>
                                    <p className="text-xl font-black text-slate-800 leading-none">{userChats.length}</p>
                                </Link>
                                <Link href="/mypage/profile-checklist" className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                        <Layout size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">充実度</p>
                                    <p className="text-xl font-black text-slate-800 leading-none">{profileCompletion}%</p>
                                </Link>
                            </div>

                            {/* Top Section: Daily Components & Quests/Activity */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Col: Fortune + Missions */}
                                <div className="md:col-span-1 space-y-6 flex flex-col">
                                    <DailyFortune dayMaster={userAnalysis?.fortune?.dayMaster} userName={currentUser?.name} />
                                    <DailyMissions missions={missions} />
                                </div>

                                {/* Right Col: Quests + Activities (placeholder for structure) */}
                                <div className="md:col-span-2 space-y-6 flex flex-col">
                                    {/* Recommended Quests */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic">
                                                <Zap className="text-amber-500" fill="currentColor" size={20} /> おすすめのクエスト
                                            </h2>
                                            <Link href="/quests" className="text-xs font-black text-blue-600 hover:gap-2 transition-all flex items-center gap-1 uppercase tracking-widest">
                                                すべて見る <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeQuests.map(quest => (
                                                <Link key={quest.id} href={`/jobs/${quest.id}`} className="group bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="bg-amber-100 text-amber-700 font-black text-[9px] px-2 py-0.5 rounded-md uppercase">Quest</span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm text-white ${quest.category === 'インターンシップ' ? 'bg-emerald-500/90' :
                                                                quest.category === '体験JOB' ? 'bg-blue-600/90' :
                                                                    'bg-slate-600/90'
                                                                }`}>
                                                                {quest.category}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400 truncate">{companies.find(c => c.id === quest.companyId)?.name}</span>
                                                        </div>
                                                        <h3 className="text-base font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{quest.title}</h3>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4 md:mt-6">
                                                        <span className="text-[10px] font-black text-slate-400">参加報酬: {quest.reward}</span>
                                                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <ArrowRight size={16} />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity / Interactions */}
                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 flex-1">
                                        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
                                            <Bell className="text-indigo-500" size={20} />
                                            最新のアクティビティ
                                        </h2>
                                        <div className="space-y-3">
                                            {(() => {
                                                // 1. Map Chats to Activity Items
                                                const chatActivities = userChats.map(chat => {
                                                    const lastMsg = chat.messages[chat.messages.length - 1];
                                                    return {
                                                        id: `chat_${chat.id}`,
                                                        type: 'message',
                                                        timestamp: chat.updatedAt,
                                                        companyId: chat.companyId,
                                                        text: lastMsg?.text || '画像/ファイルが送信されました',
                                                        relatedId: null
                                                    };
                                                });

                                                // 2. Map Interactions to Activity Items (Apply, Like, Scout)
                                                const actionActivities = interactions
                                                    .filter(i =>
                                                        (['apply', 'like_job', 'like_quest', 'complete_lesson'].includes(i.type) && i.fromId === currentUserId) ||
                                                        (['like_user', 'scout'].includes(i.type) && i.toId === currentUserId)
                                                    )
                                                    .map(i => ({
                                                        id: i.id,
                                                        type: i.type,
                                                        timestamp: i.timestamp,
                                                        companyId: ['like_user', 'scout'].includes(i.type) ? i.fromId : (i.type.startsWith('like') ? (jobs.find(j => j.id === i.toId)?.companyId) : i.toId),
                                                        text: i.type === 'scout' ? (i.metadata?.message || 'スカウトが届きました') : '',
                                                        relatedId: i.toId
                                                    }));

                                                // 3. Merge, Sort, Slice
                                                const rawCombined = [...chatActivities, ...actionActivities]
                                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                                                // Ensure uniqueness
                                                const combined = Array.from(new Map(rawCombined.map(item => [item.id, item])).values())
                                                    .slice(0, 5);

                                                if (combined.length === 0) {
                                                    return (
                                                        <div className="text-center py-8 text-slate-400">
                                                            <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                                            <p className="text-sm font-bold">まだアクティビティはありません</p>
                                                        </div>
                                                    );
                                                }

                                                return combined.map((activity: any) => {
                                                    const company = companies.find(c => c.id === activity.companyId);
                                                    let icon = <MessageSquare size={12} className="text-indigo-500" />;
                                                    let detailText = '';

                                                    switch (activity.type) {
                                                        case 'message':
                                                            detailText = activity.text?.slice(0, 30) + (activity.text?.length > 30 ? '...' : '');
                                                            break;
                                                        case 'apply':
                                                            icon = <Briefcase size={12} className="text-amber-600" />;
                                                            detailText = `応募リクエストを送信しました`;
                                                            break;
                                                        case 'like_job': case 'like_quest':
                                                            icon = <Heart size={12} fill="currentColor" className="text-red-500" />;
                                                            detailText = `気になるリストに追加しました`;
                                                            break;
                                                        case 'like_user':
                                                            icon = <Heart size={12} fill="currentColor" className="text-pink-500" />;
                                                            detailText = `社があなたに興味を持っています`;
                                                            break;
                                                        case 'scout':
                                                            icon = <Sparkles size={12} fill="currentColor" className="text-blue-500" />;
                                                            detailText = `社からスカウトが届きました`;
                                                            break;
                                                        case 'complete_lesson':
                                                            icon = <BookOpen size={12} className="text-emerald-600" />;
                                                            detailText = `レッスンを完了しました`;
                                                            break;
                                                        default:
                                                            detailText = activity.text;
                                                    }

                                                    return (
                                                        <Link
                                                            key={activity.id}
                                                            href={activity.type === 'message' ? '/messages' : (activity.relatedId ? `/jobs/${activity.relatedId}` : '#')}
                                                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                                                        >
                                                            <div className="relative w-10 h-10 flex-shrink-0">
                                                                <img
                                                                    src={company?.logo_url || company?.image || '/images/defaults/default_company_icon.png'}
                                                                    className="w-full h-full rounded-xl object-cover border border-slate-100 bg-white"
                                                                    alt=""
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        if (!target.getAttribute('data-error-tried')) {
                                                                            target.setAttribute('data-error-tried', 'true');
                                                                            target.src = '/images/defaults/default_company_icon.png';
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                                                                    {icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-sm text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                                    {company?.name || 'システム通知'}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                                    {detailText}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Section: Self-Analysis & E-Learning */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                                {/* Self-Analysis Card */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden flex flex-col">
                                    <div className="absolute right-[-10%] top-[-10%] opacity-10">
                                        <Target size={160} />
                                    </div>
                                    <div className="relative z-10 space-y-4 flex-1">
                                        <h2 className="text-lg font-black italic tracking-tighter uppercase">自己分析インサイト</h2>

                                        {hasDiagnosis ? (
                                            <div className="h-64 w-full -ml-1 mt-2">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                                        <PolarGrid stroke="#334155" />
                                                        <PolarAngleAxis
                                                            dataKey="subject"
                                                            tick={({ payload, x, y, textAnchor, stroke, radius }) => {
                                                                // Split text for better fitting
                                                                // e.g. "対人・共感" -> ["対人", "共感"]
                                                                const text = payload.value as string;
                                                                const hasDot = text.includes('・');
                                                                const words = hasDot ? text.split('・') : [text];

                                                                return (
                                                                    <g key={payload.value} transform={`translate(${x},${y})`}>
                                                                        <text
                                                                            textAnchor={textAnchor}
                                                                            fill="#94a3b8"
                                                                            fontSize={10}
                                                                            fontWeight="bold"
                                                                            style={{ pointerEvents: 'none' }}
                                                                        >
                                                                            {words.map((word, i) => (
                                                                                <tspan
                                                                                    key={i}
                                                                                    x={0}
                                                                                    dy={i === 0 ? (hasDot ? -6 : 3) : 12} // Adjust vertical center
                                                                                >
                                                                                    {word}{i < words.length - 1 && !hasDot ? '' : ''}
                                                                                </tspan>
                                                                            ))}
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }}
                                                        />
                                                        <Radar
                                                            name="Score"
                                                            dataKey="A"
                                                            stroke="#6366f1"
                                                            fill="#6366f1"
                                                            fillOpacity={0.5}
                                                        />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="h-48 w-full mt-4 flex flex-col items-center justify-center text-center space-y-3 bg-white/5 rounded-2xl p-4">
                                                <Sparkles className="text-slate-500" />
                                                <p className="text-xs text-slate-400 font-bold">
                                                    データがありません。<br />精密診断を受けてみましょう！
                                                </p>
                                            </div>
                                        )}

                                        {hasDiagnosis ? (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">あなたの突出した資質</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(userAnalysis.selectedValues || []).slice(0, 3).map(valId => {
                                                        const card = VALUE_CARDS.find(c => c.id === valId);
                                                        return (
                                                            <span key={valId} className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black">
                                                                {card ? card.name : `Value #${valId}`}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-2">
                                                <Link href="/analysis" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/10">
                                                    診断を開始する <ArrowRight size={14} />
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <Link href="/dashboard/success" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black text-center shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest mt-2">
                                        詳しい分析結果を見る
                                    </Link>
                                </div>

                                {/* E-Learning Courses - Right Side of Bottom Section */}
                                <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-6 text-white relative overflow-hidden">
                                    <div className="absolute right-[-5%] top-[-10%] opacity-10">
                                        <GraduationCap size={120} />
                                    </div>
                                    <div className="relative z-10 h-full flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                                                <BookOpen size={20} /> おすすめのコース
                                            </h2>
                                            <Link href="/reskill/courses" className="text-xs font-black text-emerald-200 hover:text-white transition-colors flex items-center gap-1">
                                                すべて見る <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            {modules.filter(m => m.title).slice(0, 3).map(course => (
                                                <Link key={course.id} href={`/reskill/course/${course.id}`} className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors group">
                                                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {course.image || course.thumbnail_url ? (
                                                            <img src={course.image || course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <PlayCircle size={24} className="text-emerald-200" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm truncate group-hover:text-emerald-200 transition-colors">{course.title}</h3>
                                                        <p className="text-[10px] text-white/60 mt-1 line-clamp-1">
                                                            {course.description || 'スキルを学びましょう'}
                                                        </p>
                                                        <p className="text-[10px] text-emerald-200 mt-1.5 font-bold">
                                                            {course.courseCount || 0} レッスン · {course.totalDuration || ''}
                                                        </p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-emerald-300 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                                </Link>
                                            ))}
                                            {modules.filter(m => m.title).length === 0 && (
                                                <div className="text-center py-6">
                                                    <p className="text-emerald-200 text-sm font-bold">コースがありません</p>
                                                    <Link href="/reskill/courses" className="text-xs text-white underline mt-2 inline-block">
                                                        コースを探す
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reskill"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Learning Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center justify-between shadow-xl shadow-emerald-900/10">
                                    <div className="absolute right-[-10%] top-[-10%] opacity-10">
                                        <Award size={140} />
                                    </div>
                                    <div className="relative z-10 space-y-2">
                                        <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Overall Progress</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-5xl font-black">{overallProgress}%</span>
                                            <span className="text-xs font-bold text-emerald-200 mb-2">completed</span>
                                        </div>
                                        <div className="w-32 h-2 bg-emerald-900/30 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-emerald-300" style={{ width: `${overallProgress}%` }} />
                                        </div>
                                    </div>
                                    <div className="relative z-10 w-20 h-20 border-4 border-emerald-500/30 rounded-full flex items-center justify-center">
                                        <Award size={32} className="text-emerald-200" />
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col justify-between shadow-sm">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acquired Skills</p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="text-4xl font-black text-slate-800">{completedLessonIds.length}</div>
                                            <div className="text-[10px] font-bold text-slate-400 leading-tight uppercase">Skills<br />Mastered</div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black border border-emerald-100">AI Basics</span>
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black border border-emerald-100">Coding</span>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                                    <div className="absolute right-[-10%] bottom-[-10%] opacity-10 group-hover:scale-110 transition-transform">
                                        <TrendingUp size={140} />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Goal Status</p>
                                        <h3 className="text-xl font-black mt-2 leading-tight">インターンシップ<br />挑戦まで あと3ステップ</h3>
                                    </div>
                                    <Link href="/quests" className="relative z-10 mt-6 inline-flex items-center gap-2 text-blue-400 text-xs font-black group-hover:gap-3 transition-all">
                                        Next Milestone <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            {/* e-Learning Tracks */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight italic">
                                        <PlayCircle className="text-blue-600" size={24} /> Learning Tracks
                                    </h2>
                                    <Link href="/reskill/courses" className="text-xs font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest">
                                        All Courses <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="space-y-6">
                                    {recentlyViewedLessons.length > 0 ? (
                                        recentlyViewedLessons.map(lesson => {
                                            if (!lesson) return null;
                                            const videoId = getYoutubeId(lesson.url || lesson.youtubeUrl || lesson.youtube_url);
                                            const thumbnailUrl = lesson.thumbnail_url || lesson.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);
                                            return (
                                                <div key={lesson?.id} className="group flex items-center gap-6 p-4 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer">
                                                    <div className="w-24 h-16 bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm">
                                                        <img
                                                            src={thumbnailUrl || "/api/placeholder/400/320"}
                                                            className={`w-full h-full object-cover ${!thumbnailUrl ? "opacity-50" : ""}`}
                                                            alt=""
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = "/api/placeholder/400/320";
                                                                target.classList.add("opacity-50");
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <PlayCircle className="text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm" size={24} />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Resume Study</p>
                                                        <h3 className="text-base font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{lesson?.title}</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Module: {lesson?.id ? lesson.id.toString().split('_')[0] : ''}</p>
                                                    </div>
                                                    <ArrowRight className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto">
                                                <BookOpen size={32} />
                                            </div>
                                            <p className="text-slate-400 font-bold italic">あなたのキャリアに最適なコースを見つけましょう</p>
                                            <Link href="/reskill/courses" className="px-8 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 inline-block">
                                                Browse Catalog
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                    }
                </AnimatePresence >
            </main >

            {/* Bottom Nav Simulation */}
            < div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-12 z-50" >
                <Link href="/" className="text-slate-400 hover:text-white transition-colors flex flex-col items-center gap-1">
                    <Search size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
                </Link>
                <Link href="/dashboard" className="text-white flex flex-col items-center gap-1">
                    <Layout size={20} className="text-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Dash</span>
                </Link>
                <Link href="/messages" className="text-slate-400 hover:text-white transition-colors flex flex-col items-center gap-1 relative">
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />}
                    <MessageSquare size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Chat</span>
                </Link>
                <Link href="/mypage" className="text-slate-400 hover:text-white transition-colors flex flex-col items-center gap-1">
                    <img
                        src={currentUser.image || getFallbackAvatarUrl(currentUser.id, currentUser.gender)}
                        className="w-5 h-5 rounded-full object-cover"
                        alt=""
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.getAttribute('data-error-tried')) {
                                target.setAttribute('data-error-tried', 'true');
                                target.src = getFallbackAvatarUrl(currentUser.id, currentUser.gender);
                            } else {
                                target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name || 'U') + '&background=random';
                            }
                        }}
                    />
                    <span className="text-[9px] font-black uppercase tracking-tighter">My</span>
                </Link>
            </div >
        </div >
    );
}
