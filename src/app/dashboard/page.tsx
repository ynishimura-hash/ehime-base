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
        authStatus
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
        let checkUserInterval: NodeJS.Timeout | null = null;
        let isMounted = true;

        const checkAuth = async (retries = 3) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                let user: any = session?.user;
                if (!user) {
                    const { data: { user: fetchedUser } } = await supabase.auth.getUser();
                    user = fetchedUser || undefined;
                }

                if (!user) {
                    if (retries > 0 && isMounted) {
                        console.log(`Dashboard: Auth check retry (${retries})...`);
                        setTimeout(() => checkAuth(retries - 1), 500);
                        return;
                    }

                    // console.log('セッションが見つかりません。環境の安定性を優先し、自動リダイレクトは行わずエラー画面を表示します。');
                    if (isMounted) {
                        setIsCheckingAuth(false);
                    }
                    return;
                }

                // If we have a user, proceed to use the session.user (or fetched user)
                // Note: session.user might be null if we fell back to getUser, so use 'user' object


                // Direct Profile Check (Bypass Store Sync Lag)
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    // If profile doesn't exist, they MUST go to onboarding
                    console.log('Profile not found in DB, redirecting to Onboarding');
                    console.log('プロフィールが見つかりません。オンボーディング未完了の可能性があります。');
                    if (isMounted) {
                        setIsCheckingAuth(false);
                    }
                    return;
                }

                // Profile Exists - Sync to Store Manually & Allow Access
                const currentStore = useAppStore.getState();
                if (currentStore.authStatus !== 'authenticated' || currentStore.currentUserId !== user.id) {
                    console.log('Syncing auth state in Dashboard (Direct) for user:', user.id);
                    currentStore.loginAs('seeker', user.id);
                    currentStore.fetchUsers();
                }

                if (isMounted) {
                    setIsCheckingAuth(false);
                }

            } catch (error) {
                console.error('認証チェックエラー:', error);
                if (isMounted) {
                    setIsCheckingAuth(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
            if (checkUserInterval) {
                clearInterval(checkUserInterval);
            }
        };
    }, [router, supabase]);

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

    // Restore Deleted Logic:
    const userChats = getUserChats(currentUserId);
    const unreadCount = userChats.reduce((acc, chat) => acc + chat.messages.filter(m => !m.isRead && m.senderId !== currentUserId).length, 0);

    // Recommendations
    const { jobs: recommendedJobs } = useMemo(() =>
        getRecommendations(userAnalysis, jobs, courses, companies),
        [userAnalysis, courses, jobs, companies]);

    const activeQuests = recommendedJobs.filter(j => j.type === 'quest').slice(0, 3);
    const activeJobs = recommendedJobs.filter(j => j.type === 'job').slice(0, 3);

    // Profile Completion Calculation
    const profileCompletion = calculateProfileCompletion(currentUser);

    // Radar Data
    const hasDiagnosis = Object.keys(userAnalysis.diagnosisScores || {}).length > 0;
    const radarData = calculateCategoryRadarData(userAnalysis.diagnosisScores || {});

    // Learning Progress
    const allLessons = courses.flatMap(c => (c.curriculums || []).flatMap(curr => curr.lessons));
    const overallProgress = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0;

    const recentlyViewedLessons = lastViewedLessonIds.map(id =>
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
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home</p>
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link href="/saved" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Heart size={20} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">気になる</p>
                                    <p className="text-xl font-black text-slate-800">{interactions.filter(i => i.type === 'like_job' && i.fromId === currentUserId).length}</p>
                                </Link>
                                <Link href="/progress" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">応募中</p>
                                    <p className="text-xl font-black text-slate-800">{interactions.filter(i => i.type === 'apply' && i.fromId === currentUserId).length}</p>
                                </Link>
                                <Link href="/messages" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center relative">
                                    {unreadCount > 0 && (
                                        <span className="absolute top-4 right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <MessageSquare size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">メッセージ</p>
                                    <p className="text-xl font-black text-slate-800">{userChats.length}</p>
                                </Link>
                                <Link href="/mypage/profile-checklist" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Layout size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">充実度</p>
                                    <p className="text-xl font-black text-slate-800">{profileCompletion}%</p>
                                </Link>
                            </div>

                            {/* Main Content Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Col: Analysis Results */}
                                <div className="md:col-span-1 space-y-6">
                                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden h-full flex flex-col">
                                        <div className="absolute right-[-10%] top-[-10%] opacity-10">
                                            <Target size={160} />
                                        </div>
                                        <div className="relative z-10 space-y-4 flex-1">
                                            <h2 className="text-lg font-black italic tracking-tighter uppercase">Success Insights</h2>

                                            {hasDiagnosis ? (
                                                <div className="h-48 w-full mt-4">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                                                            <PolarGrid stroke="#334155" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
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
                                            Full Analysis Details
                                        </Link>
                                    </div>
                                </div>


                                {/* Right Col: Recommendations */}
                                <div className="md:col-span-2 space-y-6">
                                    {/* Recommended Quests */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2 italic">
                                                <Zap className="text-amber-500" fill="currentColor" size={20} /> RECOMMENDED QUESTS
                                            </h2>
                                            <Link href="/quests" className="text-xs font-black text-blue-600 hover:gap-2 transition-all flex items-center gap-1 uppercase tracking-widest">
                                                View All <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeQuests.map(quest => (
                                                <Link key={quest.id} href={`/jobs/${quest.id}`} className="group bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all h-full flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="bg-amber-100 text-amber-700 font-black text-[9px] px-2 py-0.5 rounded-md uppercase">Quest</span>
                                                            <span className="text-[9px] font-bold text-slate-400">{companies.find(c => c.id === quest.companyId)?.name}</span>
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

                                    {/* Recent Messages Preview */}
                                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6">
                                        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-tight">
                                            <Bell className="text-indigo-500" size={20} />
                                            Latest Interactions
                                        </h2>
                                        <div className="space-y-1">
                                            {userChats.slice(0, 2).map(chat => {
                                                const company = companies.find(c => c.id === chat.companyId);
                                                const lastMsg = chat.messages[chat.messages.length - 1];
                                                return (
                                                    <Link key={chat.id} href={`/messages/${chat.companyId}`} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
                                                        <img src={company?.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-black text-sm text-slate-800 truncate">{company?.name}</p>
                                                                <p className="text-[9px] font-bold text-slate-400">
                                                                    {new Date(chat.updatedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-slate-500 truncate group-hover:text-slate-800 transition-colors">{lastMsg?.text}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                            {userChats.length === 0 && (
                                                <p className="text-center py-6 text-sm text-slate-400 font-bold italic">No active conversations yet.</p>
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
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Nav Simulation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-12 z-50">
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
            </div>
        </div >
    );
}
