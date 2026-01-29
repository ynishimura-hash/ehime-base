"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, Trophy, Zap,
    MessageSquare, Target, ArrowRight,
    Star, Flame, Shield, ArrowLeft,
    CheckCircle2, AlertCircle, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import SkillPanel from '@/components/dashboard/SkillPanel';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    ResponsiveContainer
} from 'recharts';
import { calculateCategoryRadarData, getPublicValueCards } from '@/lib/analysisUtils';
import { getRecommendations } from '@/lib/recommendation';
// import { COMPANIES } from '@/lib/dummyData'; // Removed

export default function SuccessDashboard() {
    const { userAnalysis, jobs, courses, toggleFortuneIntegration, activeRole, companies } = useAppStore();

    // 診断データの取得
    const radarData = calculateCategoryRadarData(userAnalysis.diagnosisScores || {});
    const hasData = (userAnalysis.selectedValues || []).length > 0;

    // 管理者チェック
    const isAdmin = activeRole === 'admin';

    // レコメンドロジックの適用
    const { jobs: recommendedJobs } = useMemo(() =>
        getRecommendations(userAnalysis, jobs, courses, companies),
        [userAnalysis, jobs, courses, companies]);

    const activeQuests = recommendedJobs.filter(j => j.type === 'quest').slice(0, 3);

    // 公開バリュー（コアバリュー）の取得
    const coreValues = getPublicValueCards(userAnalysis);

    const fortuneTraits = userAnalysis.isFortuneIntegrated
        ? (userAnalysis.fortune?.traits || ['誠実', '努力家'])
        : [];

    if (!hasData && !isAdmin) {
        // サクセスモード解放リクエストにより、一時的に制限解除
        // if (false) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8">
                    <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center mx-auto ring-2 ring-indigo-500/50">
                        <Lock size={48} className="text-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase underline decoration-indigo-500">Locked</h1>
                        <p className="text-slate-400 font-bold">
                            サクセスモードを起動するには、精密診断を完了し、あなたのコアバリューを特定する必要があります。
                        </p>
                    </div>
                    <Link href="/analysis">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group mt-8">
                            精密診断を開始する
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <Link href="/mypage">
                        <button className="w-full py-4 text-slate-500 font-black hover:text-white transition-colors">
                            Exit
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-indigo-500/30">
            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/mypage" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                        <ArrowLeft size={18} /> <span className="text-sm font-black uppercase tracking-tighter">Exit Success Mode</span>
                    </Link>

                    {/* Fortune Integration Toggle */}
                    <div className="hidden md:flex items-center gap-4 bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fortune Link</span>
                        <button
                            onClick={toggleFortuneIntegration}
                            className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${userAnalysis.isFortuneIntegrated ? 'bg-indigo-600' : 'bg-slate-600'}`}
                        >
                            <motion.div
                                animate={{ x: userAnalysis.isFortuneIntegrated ? 24 : 0 }}
                                className="w-4 h-4 bg-white rounded-full shadow-lg"
                            />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Level</div>
                            <div className="text-xl font-black text-white italic">08</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black italic">
                            YJ
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Hero Header - Full Width */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-2">
                            SUCCESS MODE<span className="text-indigo-500">_</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-lg max-w-2xl">
                            精密診断と占いの融合。あなたの「今」を愛媛の「未来」へ。
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-slate-900/80 backdrop-blur p-5 rounded-3xl border border-slate-800 flex items-center gap-4 shadow-xl shadow-black/20">
                            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
                                <Flame size={24} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Growth Streak</div>
                                <div className="text-xl font-black text-white">12 Days</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
                    {/* Left Side: Main Interactive Content */}
                    <div className="space-y-12">
                        {/* Skill Panel */}
                        <div className="shadow-2xl shadow-indigo-500/10 rounded-[3rem]">
                            <SkillPanel />
                        </div>
                    </div>

                    {/* Right Side: Analysis Summary (Sticky) */}
                    <div className="space-y-8 sticky top-28">
                        {/* Radar Chart Card */}
                        <div className="bg-slate-900 rounded-[3rem] p-8 border border-slate-800 relative overflow-hidden group shadow-2xl shadow-black/20">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Target size={120} />
                            </div>

                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                Potential Analysis
                            </h3>

                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                                        <Radar
                                            name="User"
                                            dataKey="A"
                                            stroke="#4f46e5"
                                            fill="#4f46e5"
                                            fillOpacity={0.4}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Tags Section */}
                            <div className="mt-8 flex flex-wrap gap-2.5">
                                {coreValues.map(v => (
                                    <span key={v.id} className="px-4 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 border border-indigo-500/20 transition-colors">
                                        {v.name}
                                    </span>
                                ))}
                                {userAnalysis.isFortuneIntegrated && fortuneTraits.map(t => (
                                    <span key={t} className="px-4 py-1.5 bg-purple-500/5 hover:bg-purple-500/10 rounded-full text-[10px] font-black text-purple-400 border border-purple-500/20 flex items-center gap-1.5 transition-colors">
                                        <Sparkles size={10} /> {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Daily Insight / Fortune Card */}
                        <div className={`rounded-[3rem] p-10 shadow-2xl relative overflow-hidden transition-all duration-700 hover:scale-[1.02] ${userAnalysis.isFortuneIntegrated
                                ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 shadow-indigo-900/20'
                                : 'bg-slate-900 border border-slate-800 shadow-black/40'
                            }`}>
                            <div className="absolute top-[-20%] right-[-10%] opacity-10 pointer-events-none">
                                <Sparkles size={240} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${userAnalysis.isFortuneIntegrated ? 'bg-white/10 text-white' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                        <MessageSquare size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                                        {userAnalysis.isFortuneIntegrated ? 'Stars & Data Insight' : 'Core Strategy'}
                                    </span>
                                </div>

                                <p className="text-xl md:text-2xl font-black leading-tight text-white italic tracking-tight">
                                    {userAnalysis.isFortuneIntegrated
                                        ? `「${coreValues[0]?.name || '価値観'}に基づいたあなたの力が今日、星の巡りと合致しました。${fortuneTraits[0]}さを意識することで、大きな成果が得られるでしょう。」`
                                        : `「現在の傾向に基づくと、${coreValues[0]?.name || '価値観'}を活かせるクエストへの挑戦が、最も効率的な経験値獲得に繋がります。」`
                                    }
                                </p>

                                <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-widest pt-4 border-t border-white/10">
                                    <Shield size={12} />
                                    Analysis Engine v1.0.4
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quests Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Trophy className="text-yellow-400" /> Recommended Quests
                        </h2>
                        <Link href="/quests" className="text-xs font-black text-indigo-400 hover:text-white transition-colors flex items-center gap-1 group">
                            VIEW ALL <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {activeQuests.length > 0 ? (
                            activeQuests.map((quest) => (
                                <Link key={quest.id} href={`/jobs/${quest.id}`}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition-all group h-full flex flex-col"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-black uppercase">Quest</div>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-yellow-500">
                                                <Star size={12} fill="currentColor" /> 500 Exp
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black group-hover:text-indigo-400 transition-colors mb-4 line-clamp-2">{quest.title}</h3>
                                        <div className="flex flex-wrap gap-1 mb-6">
                                            {(quest.tags || []).slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[8px] font-black px-1.5 py-0.5 bg-slate-800 rounded-md text-slate-400 uppercase tracking-tighter">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="text-xs font-bold text-slate-500 italic">Recommended</div>
                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                                <AlertCircle className="mx-auto text-slate-600 mb-4" size={48} />
                                <p className="text-slate-500 font-bold">まだレコメンドできるクエストがありません。<br />診断を進めて、価値観を見つけてみましょう。</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
