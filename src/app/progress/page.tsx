"use client";

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
// import { JOBS, COMPANIES } from '@/lib/dummyData'; // Removed
import {
    ChevronLeft,
    Clock,
    CheckCircle2,
    MessageSquare,
    Building2,
    Zap,
    ArrowRight,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressPage() {
    const { interactions, currentUserId, jobs, companies } = useAppStore();

    // Get applied interactions
    const appliedInteractions = interactions.filter(
        i => i.type === 'apply' && i.fromId === currentUserId
    );

    // Fetch fresh data on mount
    React.useEffect(() => {
        const loadData = async () => {
            // Refresh data to ensure cover images are present
            await Promise.all([
                useAppStore.getState().fetchJobs(),
                useAppStore.getState().fetchCompanies(),
                // useAppStore.getState().fetchUserInteractions(currentUserId)
            ]);
        };
        loadData();
    }, [currentUserId]);

    // Map interactions to job details
    const appliedJobs = appliedInteractions.map(interaction => {
        const job = jobs.find(j => j.id === interaction.toId);
        const company = companies.find(c => c.id === job?.companyId);
        return {
            ...job,
            company,
            appliedAt: interaction.timestamp,
            // Mock status for prototype
            status: '選考中'
        };
    }).filter(j => j.id);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 py-4">
                <Link href="/mypage" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-sm font-black tracking-tight text-slate-800 uppercase">進捗確認</h1>
                <div className="w-10" />
            </nav>

            <main className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col gap-4">
                    {appliedJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                <Search size={40} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-800 font-black">応募中の求人はありません</p>
                                <p className="text-slate-500 font-bold text-xsSmall">興味のあるクエストや求人を探してみましょう</p>
                            </div>
                            <Link href="/jobs" className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                                求人を探す
                            </Link>
                        </div>
                    ) : (
                        appliedJobs.map((job, idx) => {
                            // Image Logic
                            let displayImage = null;
                            if (job.type === 'quest') {
                                // 1. Job Cover -> 2. Company Cover -> 3. Company Logo
                                displayImage = job.cover_image_url || job.organization?.cover_image_url || job.company?.image;
                            } else {
                                // Job/Internship: Company Logo
                                displayImage = job.company?.image;
                            }

                            return (
                                <motion.div
                                    key={`${job.id}-${idx}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                                {/* 画像表示ロジック適用 */}
                                                {displayImage ? (
                                                    <img src={displayImage} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <Building2 className="text-slate-300" size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{job.company?.name}</p>
                                                <h3 className="text-lg font-black text-slate-800 leading-tight">{job.title}</h3>

                                                {/* クエストの場合はタグを表示 */}
                                                {job.type === 'quest' && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {job.category && (
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                                                                {job.category}
                                                            </span>
                                                        )}
                                                        {job.tags?.slice(0, 3).map(tag => (
                                                            <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black">
                                            {job.status}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            応用日: {new Date(job.appliedAt || '').toLocaleDateString('ja-JP')}
                                        </div>
                                        {job.type === 'quest' && (
                                            <div className="flex items-center gap-1.5 text-amber-600">
                                                <Zap size={14} fill="currentColor" />
                                                クエスト
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <Link href={`/jobs/${job.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black text-slate-600 transition-all">
                                            詳細を見る
                                            <ArrowRight size={14} />
                                        </Link>
                                        <Link href={`/messages/${job.company?.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-xs font-black text-white transition-all shadow-lg shadow-blue-100">
                                            <MessageSquare size={14} />
                                            メッセージ
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Legend / Info */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute right-[-5%] top-[-10%] opacity-10">
                        <CheckCircle2 size={120} />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h2 className="text-xl font-black italic tracking-tighter">SUCCESS ROAD</h2>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed">
                            応募したあとも、e-ラーニングでの学習を継続することで、企業へのアピール度が高まります。
                        </p>
                        <Link href="/elearning" className="inline-flex items-center gap-2 text-blue-400 font-black text-sm hover:gap-3 transition-all">
                            学習を続ける
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
