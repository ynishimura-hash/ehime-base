"use client";

import React, { useState, Suspense } from 'react';
import {
    Sparkles, ArrowLeft,
    Zap, Compass, Trophy,
    Clock, ArrowRight, BookOpen,
    MapPin, Building2, BarChart3
} from 'lucide-react';
import Link from 'next/link';
// import { Course, Job, Company } from '@/lib/dummyData'; // Removed
import { useAppStore } from '@/lib/appStore';
import { getRecommendations } from '@/lib/recommendation';
import StrengthsDiscovery from '@/components/analysis/StrengthsDiscovery';
import FortuneAnalysis from '@/components/analysis/FortuneAnalysis';
import PreciseDiagnosis from '@/components/analysis/PreciseDiagnosis';

import { useSearchParams } from 'next/navigation';

function AnalysisContent() {
    const { userAnalysis, jobs, courses, companies, fetchCourses } = useAppStore();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') as 'simple' | 'precise' | 'fortune' || 'simple';
    const [activeTab, setActiveTab] = useState<'simple' | 'precise' | 'fortune'>(initialTab);

    React.useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
    }, [courses.length, fetchCourses]);

    const recommendations = getRecommendations(userAnalysis, jobs, courses, companies);
    const hasAnalysis = userAnalysis.strengths || userAnalysis.fortune;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                    <Link href="/mypage" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-sm transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> マイページへ戻る
                    </Link>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        <Sparkles size={14} /> Self Analysis Portal
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">自己分析・資質診断</h1>
                    <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">
                        あなたの「強み」と「資質」を可視化し、<br className="hidden md:block" />
                        愛媛でのキャリアをより輝かせるためのヒントを見つけましょう。
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-slate-200 rounded-[2rem] max-w-xl mx-auto">
                    <button
                        onClick={() => setActiveTab('simple')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] text-sm font-black transition-all ${activeTab === 'simple' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Zap size={18} /> 簡易
                    </button>
                    <button
                        onClick={() => setActiveTab('precise')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] text-sm font-black transition-all ${activeTab === 'precise' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <BarChart3 size={18} /> 精密
                    </button>
                    <button
                        onClick={() => setActiveTab('fortune')}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.8rem] text-sm font-black transition-all ${activeTab === 'fortune' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:bg-white/50'}`}
                    >
                        <Compass size={18} /> 占い
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    {activeTab === 'simple' ? <StrengthsDiscovery /> :
                        activeTab === 'precise' ? <PreciseDiagnosis /> :
                            <FortuneAnalysis />}
                </div>

                {/* Recommendation Teaser Section (Always visible for design consistency) */}
                <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-white shadow-2xl">
                    <div className="absolute right-[-5%] bottom-[-5%] text-white/5 rotate-12">
                        <Trophy size={300} />
                    </div>
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl font-black mb-6 leading-tight">
                            診断結果から、<br /><span className="text-blue-400">あなたにぴったりのキャリア</span>をご提案。
                        </h2>
                        <p className="text-slate-400 font-bold text-lg mb-8 leading-relaxed">
                            {hasAnalysis
                                ? "現在の診断結果に基づいた、あなたにぴったりの求人やクエスト、e-ラーニング講座を以下にご提案します。"
                                : "診断を完了すると、あなたの特性にマッチした求人やクエスト、e-ラーニング講座が自動的にレコメンドされるようになります。"
                            }
                        </p>
                        <div className="flex gap-4">
                            {hasAnalysis ? (
                                <div className="bg-blue-600/20 px-8 py-4 rounded-3xl font-black border border-blue-500/30 flex items-center gap-2">
                                    <Sparkles size={20} className="text-blue-400" /> AIおすすめマッチング発動中
                                </div>
                            ) : (
                                <div className="bg-blue-600 px-8 py-4 rounded-3xl font-black shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105">
                                    <Sparkles size={20} /> AIおすすめマッチング機能
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                {hasAnalysis && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000 scroll-mt-20" id="recommendations">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white p-2 rounded-xl">
                                <Sparkles size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">あなたへのオススメ</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Jobs */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">おすすめの求人・クエスト</h3>
                                <div className="space-y-4">
                                    {recommendations.jobs.map(job => (
                                        <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${job.type === 'quest' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {job.type.toUpperCase()}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                                                    <MapPin size={12} /> {job.location?.split(' ')[0] || '愛媛県'}
                                                </div>
                                            </div>
                                            <h4 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400">
                                                <Building2 size={14} /> {companies.find(c => c.id === job.companyId)?.name}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Courses */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">おすすめのeラーニング</h3>
                                <div className="space-y-4">
                                    {recommendations.courses.map(course => (
                                        <Link key={course.id} href={`/reskill/course/${course.id}`} className="block bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition-all group">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black border border-blue-100">
                                                    {course.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                                                    <Clock size={12} /> {course.duration}
                                                </div>
                                            </div>
                                            <h4 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{course.title}</h4>
                                            <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400">
                                                <BookOpen size={14} /> {course.level}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>}>
            <AnalysisContent />
        </Suspense>
    );
}
