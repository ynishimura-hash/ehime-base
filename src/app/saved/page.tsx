"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { ChevronLeft, MapPin, Heart, ArrowRight, CheckCircle2, Building2, Briefcase, Zap, Video, Trash2, X, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { Reel } from '@/types/shared';

type Tab = 'quest' | 'job' | 'company' | 'reel' | 'approach';

// Helper for YouTube ID
const getYouTubeID = (url: string) => {
    if (!url) return '';
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[8].length === 11) ? match[8] : '';
};

export default function SavedJobsPage() {
    const { interactions, toggleInteraction, resetInteractions, currentUserId, jobs, companies, fetchJobs, fetchCompanies } = useAppStore();
    const [activeTab, setActiveTab] = useState<Tab>('quest');
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [initialReelIndex, setInitialReelIndex] = useState(0);
    const [hoveredReelIndex, setHoveredReelIndex] = useState<number | null>(null);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, entityType: 'company' | 'job' | 'quest', companyId?: string }>({ name: '', id: '', entityType: 'company' });

    const receivedInteractions = React.useMemo(() => {
        return interactions.filter(i =>
            i.toId === currentUserId && (i.type === 'like_user' || i.type === 'scout')
        ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [interactions, currentUserId]);

    // Reset Modal State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetTarget, setResetTarget] = useState<'all' | 'quest' | 'job' | 'company' | 'reel' | 'approach' | null>(null);


    React.useEffect(() => {
        if (jobs.length === 0) fetchJobs();
        if (companies.length === 0) fetchCompanies();
    }, []);

    // Helper to check if item is liked
    const isLiked = (type: 'like_job' | 'like_company' | 'like_reel' | 'like_quest', id: string) => {
        return interactions.some(i => i.type === type && i.fromId === currentUserId && i.toId === id);
    };

    // Filter jobs based on interactions
    // Filter jobs based on interactions
    const savedQuests = jobs.filter(job =>
        (isLiked('like_quest', job.id) || isLiked('like_job', job.id)) && (job.type === 'quest')
    ).map((job: any) => {
        const company = job.organization || companies.find(c => c.id === job.companyId) || {};
        return { ...job, company, organization: company };
    });

    const savedJobs = jobs.filter(job =>
        isLiked('like_job', job.id) && (job.type === 'job')
    ).map((job: any) => {
        const company = job.organization || companies.find(c => c.id === job.companyId) || {};
        return { ...job, company, organization: company };
    });

    const savedCompanies = companies.filter(company =>
        isLiked('like_company', company.id)
    );

    // Get all available reels from loaded companies and jobs to find saved ones
    const allReels = React.useMemo(() => {
        const cReels = companies.flatMap(c => (c.reels || []).map(r => ({ ...r, entityName: c.name, entityId: c.id, entityType: 'company', companyId: c.id })));
        const jReels = jobs.flatMap(j => (j.reels || []).map(r => ({ ...r, entityName: j.title, entityId: j.id, entityType: j.type === 'quest' ? 'quest' : 'job', companyId: j.companyId || j.organization?.id })));
        return [...cReels, ...jReels];
    }, [companies, jobs]);

    const savedReels = allReels.filter(reel => isLiked('like_reel', reel.id));

    // Get applied jobs for status badge
    const isApplied = (jobId: string) => {
        return interactions.some(i => i.type === 'apply' && i.fromId === currentUserId && i.toId === jobId);
    }

    const handleToggleLikeJob = (jobId: string, type: 'job' | 'quest') => {
        if (type === 'quest') {
            // Check for legacy 'like_job' on quest
            if (isLiked('like_job', jobId)) {
                toggleInteraction('like_job', currentUserId, jobId);
                // If matched with new type too, make sure to sync (remove)
                if (isLiked('like_quest', jobId)) {
                    toggleInteraction('like_quest', currentUserId, jobId);
                }
                toast.success('「気になる」を解除しました');
                return;
            }
            toggleInteraction('like_quest', currentUserId, jobId);
        } else {
            toggleInteraction('like_job', currentUserId, jobId);
        }
        // toast handling inside toggleInteraction usually, but here we override or suppress?
        // Actually appStore toggleInteraction shows toast. I should rely on that or remove duplicated toast?
        // appStore says: toast.success('お気に入りから削除しました'...)
        // So I don't need toast here.
    };

    const handleToggleLikeCompany = (companyId: string) => {
        toggleInteraction('like_company', currentUserId, companyId);
        toast.success('「気になる」を解除しました');
    };

    const handleToggleLikeReel = (reelId: string) => {
        toggleInteraction('like_reel', currentUserId, reelId);
        toast.success('「動画」の保存を解除しました');
    };

    const handleOpenReel = (reels: Reel[], index = 0, entityName: string, entityId: string, entityType: 'company' | 'job' | 'quest', companyId?: string) => {
        if (!reels || reels.length === 0) return;
        setActiveReels(reels);
        setInitialReelIndex(index);
        setActiveEntity({ name: entityName, id: entityId, entityType, companyId });
        setIsReelModalOpen(true);
    };

    const handleResetClick = (target: 'all' | 'quest' | 'job' | 'company' | 'reel' | 'approach' | null) => {
        if (!target) return;
        // Check if there are items to delete
        const count = target === 'all'
            ? savedQuests.length + savedJobs.length + savedCompanies.length + savedReels.length
            : getCount(target);

        if (count === 0) {
            toast.info('削除する項目がありません');
            return;
        }

        setResetTarget(target);
        setIsResetModalOpen(true);
    };

    const executeReset = async () => {
        if (!resetTarget) return;

        await resetInteractions(resetTarget === 'all' ? undefined : resetTarget);
        setIsResetModalOpen(false);
        setResetTarget(null);
    };

    const getCount = (tab: Tab) => {
        switch (tab) {
            case 'quest': return savedQuests.length;
            case 'job': return savedJobs.length;
            case 'company': return savedCompanies.length;
            case 'reel': return savedReels.length;
            case 'approach': return receivedInteractions.length;
        }
    };

    const isEmpty = getCount(activeTab) === 0;

    return (
        <div className="min-h-screen bg-zinc-50 pb-24">
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-6 py-4 md:px-12">
                <Link href="/jobs" className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-600">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-sm font-black tracking-tight text-zinc-800 uppercase">気になるリスト</h1>
                <button
                    onClick={() => handleResetClick('all')}
                    className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full transition-colors"
                    title="すべてリセット"
                >
                    <Trash2 size={20} />
                </button>
            </nav>

            <main className="max-w-xl mx-auto p-4 space-y-6">
                {/* Tabs */}
                <div className="flex bg-zinc-200/50 p-1.5 rounded-2xl mx-2 overflow-x-auto scrollbar-hide">
                    {(['quest', 'job', 'company', 'reel', 'approach'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            {tab === 'quest' && <Zap size={14} className={activeTab === tab ? 'text-eis-yellow' : ''} />}
                            {tab === 'job' && <Briefcase size={14} className={activeTab === tab ? 'text-blue-500' : ''} />}
                            {tab === 'company' && <Building2 size={14} className={activeTab === tab ? 'text-zinc-800' : ''} />}
                            {tab === 'reel' && <Video size={14} className={activeTab === tab ? 'text-purple-500' : ''} />}
                            {tab === 'approach' && <Sparkles size={14} className={activeTab === tab ? 'text-orange-500' : ''} />}
                            <span className="uppercase tracking-wider hidden sm:inline whitespace-nowrap">
                                {tab === 'quest' ? 'クエスト' : tab === 'job' ? '求人' : tab === 'company' ? '企業' : tab === 'reel' ? '動画' : 'アプローチ'}
                            </span>
                            <span className="sm:hidden whitespace-nowrap">
                                {tab === 'quest' ? 'Q' : tab === 'job' ? '求' : tab === 'company' ? '企' : tab === 'reel' ? '動' : 'ア'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ml-auto sm:ml-1 ${activeTab === tab ? 'bg-zinc-100 text-zinc-600' : 'text-zinc-400'}`}>
                                {getCount(tab)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Navigation Buttons (Context-specific, only if NOT empty) */}
                {!isEmpty && (
                    <div className="px-2">
                        {activeTab === 'reel' && (
                            <Link href="/reels" className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-sm font-black transition-colors border border-purple-100 shadow-sm">
                                <Video size={16} />
                                <span>動画を探す</span>
                            </Link>
                        )}
                        {activeTab === 'quest' && (
                            <Link href="/quests" className="w-full flex items-center justify-center gap-2 py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-sm font-black transition-colors border border-amber-100 shadow-sm">
                                <Zap size={16} />
                                <span>クエストを探す</span>
                            </Link>
                        )}
                        {activeTab === 'job' && (
                            <Link href="/jobs" className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-black transition-colors border border-blue-100 shadow-sm">
                                <Briefcase size={16} />
                                <span>求人を探す</span>
                            </Link>
                        )}
                        {activeTab === 'company' && (
                            <Link href="/companies" className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-sm font-black transition-colors border border-zinc-200 shadow-sm">
                                <Building2 size={16} />
                                <span>企業を探す</span>
                            </Link>
                        )}
                    </div>
                )}

                {/* Reset Category Button (only if current tab not empty) */}
                {!isEmpty && (
                    <div className="flex justify-end px-4">
                        <button
                            onClick={() => handleResetClick(activeTab)}
                            className="text-xs font-bold text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                        >
                            <Trash2 size={12} />
                            このリストを空にする
                        </button>
                    </div>
                )}

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300">
                            <Heart size={40} />
                        </div>
                        <p className="text-zinc-500 font-bold">
                            {activeTab === 'quest' ? '保存されたクエストはありません' :
                                activeTab === 'job' ? '保存された求人はありません' :
                                    activeTab === 'reel' ? '保存された動画はありません' :
                                        activeTab === 'approach' ? '企業からのアプローチはまだありません' :
                                            '保存された企業はありません'}
                        </p>
                        <Link href={activeTab === 'company' ? '/companies' : activeTab === 'quest' ? '/quests' : activeTab === 'reel' ? '/reels' : activeTab === 'approach' ? '/mypage/edit' : '/jobs'} className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors">
                            {activeTab === 'company' ? '企業を探す' :
                                activeTab === 'quest' ? 'クエストを探す' :
                                    activeTab === 'reel' ? '動画を探す' :
                                        activeTab === 'approach' ? 'プロフィールを編集する' :
                                            '求人を探す'}
                        </Link>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {activeTab === 'approach' ? (
                            // Render Approaches (Received Likes/Scouts from Companies)
                            receivedInteractions.map(interaction => {
                                const company = companies.find(c => c.id === interaction.fromId);
                                const isScout = interaction.type === 'scout';
                                const message = interaction.metadata?.message;

                                // Mark as read when rendered (simple approach)
                                React.useEffect(() => {
                                    if (!interaction.isRead && interaction.id) {
                                        const timer = setTimeout(() => {
                                            const { markInteractionAsRead } = useAppStore.getState();
                                            markInteractionAsRead(interaction.id!);
                                        }, 1000);
                                        return () => clearTimeout(timer);
                                    }
                                }, [interaction.id, interaction.isRead]);

                                return (
                                    <motion.div
                                        key={interaction.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className={`group relative bg-white rounded-3xl p-5 shadow-sm border ${!interaction.isRead ? 'border-orange-200 bg-orange-50/10' : 'border-zinc-100'} hover:shadow-lg transition-all`}
                                    >
                                        {!interaction.isRead && (
                                            <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-orange-200 animate-pulse">
                                                NEW
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative">
                                                <img
                                                    src={company?.cover_image_url || company?.image || '/images/defaults/default_company_cover.png'}
                                                    alt={company?.name}
                                                    className="w-14 h-14 rounded-2xl object-cover border border-zinc-100"
                                                />
                                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg text-white shadow-sm ${isScout ? 'bg-orange-500' : 'bg-red-500'}`}>
                                                    {isScout ? <Sparkles size={12} /> : <Heart size={12} fill="currentColor" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isScout ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                                                        {isScout ? 'スカウト受信' : '検討中リストへの追加'}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-bold">
                                                        {new Date(interaction.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-base font-black text-zinc-800 truncate leading-tight">{company?.name || '企業情報取得中...'}</h3>
                                                <p className="text-xs text-zinc-500 font-bold mt-0.5">{company?.industry}</p>
                                            </div>
                                        </div>

                                        {message && (
                                            <div className="bg-zinc-50 rounded-2xl p-4 mb-4 relative">
                                                <div className="absolute -top-2 left-4 w-4 h-4 bg-zinc-50 rotate-45 border-l border-t border-zinc-50" />
                                                <p className="text-sm font-bold text-zinc-600 line-clamp-3 leading-relaxed">
                                                    {message}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/companies/${interaction.fromId}`}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl text-xs font-black transition-colors"
                                            >
                                                <Building2 size={14} />
                                                企業詳細
                                            </Link>
                                            {isScout && (
                                                <Link
                                                    href="/messages"
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-eis-navy hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                                                >
                                                    <MessageCircle size={14} />
                                                    チャットで返信
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : activeTab === 'company' ? (
                            // Render Companies
                            savedCompanies.map(company => (
                                <motion.div
                                    key={company.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="group relative bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 hover:shadow-lg transition-shadow"
                                >

                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={company.cover_image_url || company.image}
                                                alt={company.name}
                                                className="w-16 h-16 rounded-2xl object-cover border border-zinc-100"
                                            />
                                            {company.reels && company.reels.length > 0 && (
                                                <div className="absolute -bottom-2 -right-2 z-10">
                                                    <ReelIcon
                                                        reels={company.reels}
                                                        size="sm"
                                                        onClick={() => handleOpenReel(company.reels!, 0, company.name, company.id, 'company', company.id)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-zinc-400 font-black tracking-wider uppercase mb-1">{company.industry}</p>
                                            <h3 className="text-base font-black text-zinc-800 truncate leading-tight group-hover:text-blue-600 transition-colors">{company.name}</h3>
                                            <p className="text-xs text-zinc-500 mt-1 truncate">{company.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-zinc-50">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleToggleLikeCompany(company.id);
                                            }}
                                            className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                        >
                                            <Heart size={18} fill="currentColor" />
                                        </button>
                                        <Link href={`/companies/${company.id}`} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        ) : activeTab === 'reel' ? (
                            // Render Reels
                            savedReels.map((reel: any, index: number) => (
                                <motion.div
                                    key={reel.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    className="group relative bg-white rounded-3xl p-3 shadow-sm border border-zinc-100 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        <div
                                            className="relative w-24 h-32 rounded-xl overflow-hidden cursor-pointer bg-black"
                                            onClick={() => handleOpenReel(savedReels as Reel[], index, reel.entityName, reel.entityId, reel.entityType as any, reel.companyId)}
                                            onMouseEnter={(e) => {
                                                setHoveredReelIndex(index);
                                                const video = e.currentTarget.querySelector('video');
                                                if (video) video.play().catch(() => { });
                                            }}
                                            onMouseLeave={(e) => {
                                                setHoveredReelIndex(null);
                                                const video = e.currentTarget.querySelector('video');
                                                if (video) {
                                                    video.pause();
                                                    video.currentTime = 0;
                                                }
                                            }}
                                        >
                                            {reel.type === 'file' || (reel.url && (reel.url.includes('.mp4') || reel.url.includes('.mov') || reel.url.includes('.webm'))) ? (
                                                <video
                                                    src={`${reel.url}#t=0.001`}
                                                    className="w-full h-full object-cover opacity-90"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                index === hoveredReelIndex ? (
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${getYouTubeID(reel.url || '')}?autoplay=1&mute=1&controls=0&start=0&rel=0`}
                                                        className="w-full h-full object-cover pointer-events-none"
                                                        allow="autoplay; encrypted-media"
                                                    />
                                                ) : (
                                                    <img
                                                        src={reel.thumbnail || `https://img.youtube.com/vi/${getYouTubeID(reel.url || '')}/0.jpg`}
                                                        alt={reel.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )
                                            )}
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors flex items-center justify-center pointer-events-none">
                                                <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                                                    <Video size={16} className="text-white fill-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 py-1 flex flex-col">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1 line-clamp-1">{reel.entityName}</p>
                                                <h3 className="text-sm font-black text-zinc-800 line-clamp-2 leading-tight mb-2">{reel.caption || reel.title || '無題の動画'}</h3>
                                            </div>

                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggleLikeReel(reel.id);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                                >
                                                    <Heart size={16} fill="currentColor" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Render Jobs or Quests
                            (activeTab === 'quest' ? savedQuests : savedJobs).map(job => {
                                return (
                                    <motion.div
                                        key={job.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className="group relative bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 hover:shadow-lg transition-shadow"
                                    >
                                        {/* Status Badge if Applied */}
                                        {isApplied(job.id) && (
                                            <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                                <CheckCircle2 size={12} />
                                                申し込み済み
                                            </div>
                                        )}

                                        {/* Company Info */}

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                <img
                                                    src={job.company?.cover_image_url || job.company?.image}
                                                    alt={job.company?.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-zinc-100"
                                                />
                                                {job.reels && job.reels.length > 0 && (
                                                    <div className="absolute -bottom-1 -right-1 z-10">
                                                        <ReelIcon
                                                            reels={job.reels}
                                                            size="sm"
                                                            onClick={() => handleOpenReel(job.reels!, 0, job.title, job.id, job.type === 'quest' ? 'quest' : 'job', job.companyId)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-zinc-400 font-black tracking-wider uppercase">{job.company?.industry}</p>
                                                <p className="text-xs font-bold text-zinc-600">{job.company?.name}</p>
                                            </div>
                                        </div>

                                        {/* Job Title */}
                                        <Link href={`/jobs/${job.id}`} className="block">
                                            <h3 className="text-lg font-black text-zinc-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                                                {job.title}
                                            </h3>
                                        </Link>

                                        {/* Tag for Job/Quest Type */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${job.category === '体験JOB' ? 'bg-yellow-100 text-yellow-700' :
                                                job.category === 'インターンシップ' ? 'bg-green-100 text-green-700' :
                                                    'bg-zinc-100 text-zinc-500'
                                                }`}>
                                                {job.category}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                                <MapPin size={14} />
                                                {job.company?.location}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleToggleLikeJob(job.id, job.type);
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                                                >
                                                    <Heart size={18} fill="currentColor" />
                                                </button>
                                                <Link href={`/jobs/${job.id}`} className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all">
                                                    <ArrowRight size={20} />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* Reel Modal */}
            <AnimatePresence>
                {isReelModalOpen && (
                    <ReelModal
                        isOpen={isReelModalOpen}
                        onClose={() => setIsReelModalOpen(false)}
                        reels={activeReels}
                        initialReelIndex={initialReelIndex}
                        entityName={activeEntity.name}
                        entityId={activeEntity.id}
                        entityType={activeEntity.entityType}
                        companyId={activeEntity.companyId}
                    />
                )}
            </AnimatePresence>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {isResetModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                        >
                            <button
                                onClick={() => setIsResetModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200"
                            >
                                <X size={16} />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4 pt-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                    <Trash2 size={32} />
                                </div>

                                <h3 className="text-xl font-black text-zinc-800">
                                    {resetTarget === 'all' ? 'すべて削除しますか？' :
                                        resetTarget === 'quest' ? 'クエストリストを空にしますか？' :
                                            resetTarget === 'job' ? '求人リストを空にしますか？' :
                                                resetTarget === 'reel' ? '保存した動画を削除しますか？' :
                                                    '企業リストを空にしますか？'}
                                </h3>

                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                                    {resetTarget === 'all'
                                        ? '保存したすべての項目がリストから削除されます。この操作は取り消せません。'
                                        : 'このリスト内のすべての項目が削除されます。この操作は取り消せません。'}
                                </p>

                                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                                    <button
                                        onClick={() => setIsResetModalOpen(false)}
                                        className="py-3 rounded-xl font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={executeReset}
                                        className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                                    >
                                        削除する
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    );
}
