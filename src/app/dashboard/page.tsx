"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/lib/appStore';
import { JOBS, COMPANIES } from '@/lib/dummyData';
import {
    Zap, Briefcase, BookOpen, Target,
    Sparkles, MessageSquare, Heart, TrendingUp,
    ChevronRight, PlayCircle, Award, Layout,
    GraduationCap, Search, Bell, ArrowRight, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecommendations } from '@/lib/recommendation';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { calculateCategoryRadarData } from '@/lib/analysisUtils';

export default function SeekerDashboard() {
    const {
        personaMode,
        setPersonaMode,
        currentUserId,
        users,
        userAnalysis,
        jobs,
        courses,
        interactions,
        completedLessonIds,
        lastViewedLessonIds,
        getUserChats
    } = useAppStore();

    const currentUser = users.find(u => u.id === currentUserId);
    const userChats = getUserChats(currentUserId);
    const unreadCount = userChats.reduce((acc, chat) => acc + chat.messages.filter(m => !m.isRead && m.senderId !== currentUserId).length, 0);

    // Recommendations
    const { jobs: recommendedJobs } = useMemo(() =>
        getRecommendations(userAnalysis, JOBS, courses, COMPANIES),
        [userAnalysis, courses]);

    const activeQuests = recommendedJobs.filter(j => j.type === 'quest').slice(0, 3);
    const activeJobs = recommendedJobs.filter(j => j.type === 'job').slice(0, 3);

    // Radar Data
    const radarData = calculateCategoryRadarData(userAnalysis.diagnosisScores || {});

    // Learning Progress
    const allLessons = courses.flatMap(c => c.curriculums.flatMap(curr => curr.lessons));
    const overallProgress = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0;

    const recentlyViewedLessons = lastViewedLessonIds.map(id =>
        allLessons.find(l => l.id === id)
    ).filter(Boolean);

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Top Bar */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={currentUser.image} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100" alt="" />
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard</p>
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
                            key="seeker"
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
                                <Link href="/analysis" className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group text-center">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Sparkles size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">診断状況</p>
                                    <p className="text-xl font-black text-slate-800">{Object.keys(userAnalysis.diagnosisScores || {}).length >= 50 ? '100%' : '未完了'}</p>
                                </Link>
                            </div>

                            {/* Main Content Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Left Col: Analysis Results */}
                                <div className="md:col-span-1 space-y-6">
                                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white relative overflow-hidden h-full">
                                        <div className="absolute right-[-10%] top-[-10%] opacity-10">
                                            <Target size={160} />
                                        </div>
                                        <div className="relative z-10 space-y-4">
                                            <h2 className="text-lg font-black italic tracking-tighter uppercase">Success Insights</h2>

                                            {/* Radar Preview */}
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

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">あなたの突出した資質</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(userAnalysis.selectedValues || []).slice(0, 3).map(valId => (
                                                        <span key={valId} className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black">Value #{valId}</span>
                                                    ))}
                                                    {(!userAnalysis.selectedValues?.length) && <p className="text-xs text-slate-500 italic">診断後に表示されます</p>}
                                                </div>
                                            </div>

                                            <Link href="/dashboard/success" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black text-center shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-widest">
                                                Full Analysis Details
                                            </Link>
                                        </div>
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
                                                            <span className="text-[9px] font-bold text-slate-400">{COMPANIES.find(c => c.id === quest.companyId)?.name}</span>
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
                                                const company = COMPANIES.find(c => c.id === chat.companyId);
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
                                        recentlyViewedLessons.map(lesson => (
                                            <div key={lesson?.id} className="group flex items-center gap-6 p-4 border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer">
                                                <div className="w-24 h-16 bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm">
                                                    <img src="/api/placeholder/400/320" className="w-full h-full object-cover opacity-50" alt="" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <PlayCircle className="text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Resume Study</p>
                                                    <h3 className="text-base font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{lesson?.title}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Module: {lesson?.id.split('_')[0]}</p>
                                                </div>
                                                <ArrowRight className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                                            </div>
                                        ))
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
                    <img src={currentUser.image} className="w-5 h-5 rounded-full object-cover" alt="" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">My</span>
                </Link>
            </div>
        </div>
    );
}
