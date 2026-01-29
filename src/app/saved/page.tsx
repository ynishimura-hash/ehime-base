"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { ChevronLeft, MapPin, Heart, ArrowRight, CheckCircle2, Building2, Briefcase, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { Reel } from '@/types/shared';

type Tab = 'quest' | 'job' | 'company';

export default function SavedJobsPage() {
    const { interactions, toggleInteraction, currentUserId, jobs, companies, fetchJobs, fetchCompanies } = useAppStore();
    const [activeTab, setActiveTab] = useState<Tab>('quest');
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, entityType: 'company' | 'job' | 'quest', companyId?: string }>({ name: '', id: '', entityType: 'company' });

    React.useEffect(() => {
        if (jobs.length === 0) fetchJobs();
        if (companies.length === 0) fetchCompanies();
    }, []);

    // Helper to check if item is liked
    const isLiked = (type: 'like_job' | 'like_company', id: string) => {
        return interactions.some(i => i.type === type && i.fromId === currentUserId && i.toId === id);
    };

    // Filter jobs based on interactions
    const savedQuests = jobs.filter(job =>
        isLiked('like_job', job.id) && (job.type === 'quest')
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

    // Get applied jobs for status badge
    const isApplied = (jobId: string) => {
        return interactions.some(i => i.type === 'apply' && i.fromId === currentUserId && i.toId === jobId);
    }

    const handleToggleLikeJob = (jobId: string) => {
        toggleInteraction('like_job', currentUserId, jobId);
        toast.success('「気になる」を解除しました');
    };

    const handleToggleLikeCompany = (companyId: string) => {
        toggleInteraction('like_company', currentUserId, companyId);
        toast.success('「気になる」を解除しました');
    };



    const handleOpenReel = (reels: Reel[], entityName: string, entityId: string, entityType: 'company' | 'job' | 'quest', companyId?: string) => {
        if (!reels || reels.length === 0) return;
        setActiveReels(reels);
        setActiveEntity({ name: entityName, id: entityId, entityType, companyId });
        setIsReelModalOpen(true);
    };

    const getCount = (tab: Tab) => {
        switch (tab) {
            case 'quest': return savedQuests.length;
            case 'job': return savedJobs.length;
            case 'company': return savedCompanies.length;
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
                <div className="w-10" />
            </nav>

            <main className="max-w-xl mx-auto p-4 space-y-6">
                {/* Tabs */}
                <div className="flex bg-zinc-200/50 p-1 rounded-2xl mx-2">
                    {(['quest', 'job', 'company'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                        >
                            {tab === 'quest' && <Zap size={14} className={activeTab === tab ? 'text-eis-yellow' : ''} />}
                            {tab === 'job' && <Briefcase size={14} className={activeTab === tab ? 'text-blue-500' : ''} />}
                            {tab === 'company' && <Building2 size={14} className={activeTab === tab ? 'text-zinc-800' : ''} />}
                            <span className="uppercase tracking-wider">
                                {tab === 'quest' ? 'クエスト' : tab === 'job' ? '求人' : '企業'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ml-1 ${activeTab === tab ? 'bg-zinc-100 text-zinc-600' : 'text-zinc-400'}`}>
                                {getCount(tab)}
                            </span>
                        </button>
                    ))}
                </div>

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300">
                            <Heart size={40} />
                        </div>
                        <p className="text-zinc-500 font-bold">
                            {activeTab === 'quest' ? '保存されたクエストはありません' :
                                activeTab === 'job' ? '保存された求人はありません' :
                                    '保存された企業はありません'}
                        </p>
                        <Link href={activeTab === 'company' ? '/companies' : '/jobs'} className="bg-zinc-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors">
                            {activeTab === 'company' ? '企業を探す' : '探す'}
                        </Link>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {activeTab === 'company' ? (
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
                                                        onClick={() => handleOpenReel(company.reels!, company.name, company.id, 'company', company.id)}
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
                                                            onClick={() => handleOpenReel(job.reels!, job.title, job.id, job.type === 'quest' ? 'quest' : 'job', job.companyId)}
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
                                                        handleToggleLikeJob(job.id);
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
                        entityName={activeEntity.name}
                        entityId={activeEntity.id}
                        entityType={activeEntity.entityType}
                        companyId={activeEntity.companyId}
                    />
                )}
            </AnimatePresence>
        </div>

    );
}
