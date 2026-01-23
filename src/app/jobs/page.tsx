"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { useSearchParams } from 'next/navigation';
import { Building2, Heart, Search, Filter, X, ChevronDown, ChevronUp, MapPin, Briefcase, JapaneseYen, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { Reel } from '@/lib/dummyData';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { fetchJobsAction } from '@/app/admin/actions';

function JobsContent() {
    const searchParams = useSearchParams();
    const { interactions, toggleInteraction, activeRole, currentUserId } = useAppStore();
    const supabase = createClient();

    // Mapping area parameter to regional keywords
    const areaMap: Record<string, string> = {
        'chuyo': '中予',
        'toyo': '東予',
        'nanyo': '南予',
    };

    const initialQ = searchParams.get('q') || '';
    const initialAreaParam = searchParams.get('area') || '';
    const initialIndustry = searchParams.get('industry') || '';
    const initialArea = areaMap[initialAreaParam] || '';

    // State
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(initialQ);
    const [selectedArea, setSelectedArea] = useState(initialArea);
    const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Reel State
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, companyId?: string }>({ name: '', id: '' });

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const { fetchPublicJobsAction } = await import('@/app/admin/actions');
            const result = await fetchPublicJobsAction();

            if (result.success && result.data) {
                console.log('fetchJobs: SUCCESS', result.data.length, 'rows found');
                // Client-side filtering for 'job' type - be more inclusive
                const filtered = result.data.filter((job: any) => {
                    const type = job.type || job.value_tags_ai?.type;
                    console.log(`Job ID: ${job.id}, Type: ${type}`);
                    return !type || type === 'job' || type === 'null' || type === 'company'; // Loosen for debug
                });
                console.log('fetchJobs: FILTERED', filtered.length, 'rows remaining');
                setJobs(filtered);
            } else {
                console.error('Error fetching jobs:', result.error);
                toast.error('求人の取得に失敗しました');
            }
        } catch (e) {
            console.error('Server action error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const allTags = Array.from(new Set(jobs.flatMap(j => (j.tags || []))));

    // Filtering Logic
    const filteredJobs = jobs.filter(job => {
        const company = job.organization;
        // Merge value_tags_ai
        const jobData = { ...job, ...job.value_tags_ai };

        const query = searchQuery.toLowerCase();

        // 1. Keyword Search
        const matchesSearch = !query ||
            jobData.title?.toLowerCase().includes(query) ||
            company?.name?.toLowerCase().includes(query) ||
            jobData.location?.toLowerCase().includes(query) ||
            (jobData.tags || []).some((t: string) => t.toLowerCase().includes(query));

        // 2. Area Filter
        const regionCities: Record<string, string[]> = {
            '中予': ['松山', '伊予', '東温', '久万高原', '松前', '砥部'],
            '東予': ['今治', '新居浜', '西条', '四国中央', '上島'],
            '南予': ['宇和島', '八幡浜', '大洲', '西予', '内子', '伊方', '松野', '鬼北', '愛南']
        };
        const cities = regionCities[selectedArea] || [];
        const matchesArea = !selectedArea ||
            jobData.location?.includes(selectedArea) ||
            company?.location?.includes(selectedArea) ||
            cities.some(city => jobData.location?.includes(city) || company?.location?.includes(city));

        // 3. Industry Filter
        const matchesIndustry = !selectedIndustry || company?.industry === selectedIndustry;

        // 4. Tag Filter
        const matchesTags = selectedTags.length === 0 || selectedTags.some(t => (jobData.tags || []).includes(t));

        // 4. Condition Filter
        let matchesConditions = true;
        if (selectedConditions.length > 0) {
            const tags = jobData.tags || [];
            if (selectedConditions.includes('unexperienced')) {
                const isUnexperienced = tags.some((t: string) => ['未経験OK', '新卒', '未経験'].includes(t));
                if (!isUnexperienced) matchesConditions = false;
            }
            if (selectedConditions.includes('remote')) {
                const isRemote = tags.some((t: string) => ['リモート', 'テレワーク', '在宅'].includes(t)) || jobData.welfare?.includes('リモート');
                if (!isRemote) matchesConditions = false;
            }
            if (selectedConditions.includes('weekend')) {
                const isWeekend = tags.includes('土日祝休み') || jobData.holidays?.includes('土日');
                if (!isWeekend) matchesConditions = false;
            }
        }

        return matchesSearch && matchesArea && matchesIndustry && matchesTags && matchesConditions;
    });

    const isLiked = (jobId: string) => {
        return interactions.some(i => i.type === 'like_job' && i.fromId === currentUserId && i.toId === jobId);
    };

    const toggleLike = (jobId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleInteraction('like_job', currentUserId, jobId);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const toggleCondition = (condition: string) => {
        if (selectedConditions.includes(condition)) {
            setSelectedConditions(selectedConditions.filter(c => c !== condition));
        } else {
            setSelectedConditions([...selectedConditions, condition]);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedArea('');
        setSelectedIndustry('');
        setSelectedTags([]);
        setSelectedConditions([]);
    };

    const activeFilterCount = selectedTags.length + selectedConditions.length + (selectedArea ? 1 : 0) + (selectedIndustry ? 1 : 0);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 text-slate-900">
            {/* Unified Header Section */}
            <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                                <Briefcase size={32} className="text-blue-600" />
                                求人情報一覧
                            </h1>
                            <p className="text-slate-500 font-bold mt-1 text-xs md:text-sm pl-11">
                                愛媛県内の魅力的な企業の求人情報。
                            </p>
                        </div>
                    </div>

                    {/* Unified Search & Filter Bar */}
                    <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-400 pointer-events-none">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="キーワード検索 (職種, 企業名, 地域など)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-none focus:ring-0 font-bold text-slate-700 text-base placeholder:font-medium placeholder:text-slate-400"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                {(activeFilterCount > 0 || searchQuery) && (
                                    <button
                                        onClick={clearFilters}
                                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                                        title="検索条件をクリア"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shadow-sm border ${isFilterOpen || activeFilterCount > 0
                                        ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    <Filter size={18} />
                                    <span className="hidden md:inline">絞り込み</span>
                                    {activeFilterCount > 0 && (
                                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 min-w-[18px] text-center font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Applied Filters Tags */}
                        {(searchQuery || activeFilterCount > 0) && (
                            <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-white/40 border-t border-slate-100/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">適用中:</span>
                                {searchQuery && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-md border border-blue-100">
                                        キーワード: {searchQuery}
                                        <X size={10} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                                    </span>
                                )}
                                {selectedArea && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-md border border-amber-100">
                                        エリア: {selectedArea}
                                        <X size={10} className="cursor-pointer" onClick={() => setSelectedArea('')} />
                                    </span>
                                )}
                                {selectedIndustry && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-md border border-indigo-100">
                                        業種: {selectedIndustry}
                                        <X size={10} className="cursor-pointer" onClick={() => setSelectedIndustry('')} />
                                    </span>
                                )}
                                {selectedConditions.includes('unexperienced') && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-black rounded-md border border-green-100">
                                        未経験歓迎
                                        <X size={10} className="cursor-pointer" onClick={() => toggleCondition('unexperienced')} />
                                    </span>
                                )}
                                {selectedConditions.includes('remote') && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-black rounded-md border border-purple-100">
                                        リモート
                                        <X size={10} className="cursor-pointer" onClick={() => toggleCondition('remote')} />
                                    </span>
                                )}
                                {selectedConditions.includes('weekend') && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-black rounded-md border border-orange-100">
                                        土日祝休み
                                        <X size={10} className="cursor-pointer" onClick={() => toggleCondition('weekend')} />
                                    </span>
                                )}
                                {selectedTags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-md border border-slate-200">
                                        #{tag}
                                        <X size={10} className="cursor-pointer" onClick={() => toggleTag(tag)} />
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Collapsible Detailed Filters */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="p-4 md:p-6 border-t border-slate-200 bg-white/50 rounded-b-xl space-y-6 mt-2">
                                {/* Area Filter */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-black text-slate-700">エリア</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['中予', '東予', '南予'].map(area => (
                                            <button
                                                key={area}
                                                onClick={() => setSelectedArea(selectedArea === area ? '' : area)}
                                                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedArea === area
                                                    ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-200'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                    }`}
                                            >
                                                {area}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Industry Filter */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-black text-slate-700">業種</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'IT・システム開発',
                                            '製造・エンジニアリング',
                                            'サービス・観光・飲食店',
                                            '農業・一次産業',
                                            '物流・運送',
                                            '医療・福祉',
                                            'その他'
                                        ].map(industry => (
                                            <button
                                                key={industry}
                                                onClick={() => setSelectedIndustry(selectedIndustry === industry ? '' : industry)}
                                                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedIndustry === industry
                                                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                    }`}
                                            >
                                                {industry}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-black text-slate-700">こだわり条件</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => toggleCondition('unexperienced')}
                                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedConditions.includes('unexperienced') ? 'bg-green-50 border-green-400 text-green-700 ring-2 ring-green-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                        >
                                            🔰 未経験歓迎
                                        </button>
                                        <button
                                            onClick={() => toggleCondition('remote')}
                                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedConditions.includes('remote') ? 'bg-purple-50 border-purple-400 text-purple-700 ring-2 ring-purple-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                        >
                                            🏠 リモート・在宅
                                        </button>
                                        <button
                                            onClick={() => toggleCondition('weekend')}
                                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedConditions.includes('weekend') ? 'bg-orange-50 border-orange-400 text-orange-700 ring-2 ring-orange-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                        >
                                            📅 土日祝休み
                                        </button>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-black text-slate-700">人気タグ</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-4 py-2 text-xs font-bold rounded-full transition-all border shadow-sm hover:-translate-y-0.5 ${selectedTags.includes(tag)
                                                    ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-sm font-bold text-slate-500">{filteredJobs.length}件の求人</span>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-slate-400" />
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map(job => {
                            const company = job.organization;
                            const jobData = { ...job, ...job.value_tags_ai };
                            const mainImage = jobData.cover_image || company.cover_image_url || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800';
                            const subImages = company.images && company.images.length >= 3 ? company.images : [mainImage, mainImage, mainImage];

                            return (
                                <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                                    <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1 relative">

                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 transition-transform group-hover:scale-110">
                                            <div onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveReels(company.reels || []);
                                                setActiveEntity({ name: job.title, id: job.id, companyId: company.id });
                                                setIsReelModalOpen(true);
                                            }}>
                                                <ReelIcon
                                                    reels={company.reels || []}
                                                    fallbackImage={company.cover_image_url}
                                                    onClick={() => { }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => toggleLike(job.id, e)}
                                            className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-sm hover:bg-red-50 hover:scale-110 transition-all group/heart"
                                        >
                                            <Heart
                                                size={24}
                                                className={`transition-colors ${isLiked(job.id) ? 'text-red-500 fill-red-500' : 'text-slate-300 group-hover/heart:text-red-500'}`}
                                            />
                                        </button>

                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-full md:w-80 shrink-0">
                                                <div className="space-y-2">
                                                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 relative">
                                                        <img src={mainImage} alt={job.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600/90 text-white text-[10px] font-bold rounded shadow-sm">
                                                            {job.category || '中途'}
                                                        </span>
                                                        {company.is_premium && (
                                                            <span className="absolute top-2 right-2 bg-yellow-400 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                                                                ★ PREMIUM
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {subImages.slice(0, 3).map((img: string, idx: number) => (
                                                            <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col pr-24 md:pr-36">
                                                <div className="mb-1">
                                                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-1.5">
                                                        <Building2 size={12} />
                                                        {company.name}
                                                    </div>
                                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                                                        {jobData.title}
                                                    </h2>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(jobData.tags || []).slice(0, 4).map((tag: string) => (
                                                        <span key={tag} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{jobData.location || company.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <JapaneseYen size={14} className="text-blue-400 shrink-0" />
                                                        <span className="truncate text-base">{jobData.reward || jobData.salary || '要相談'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-600 md:col-span-2">
                                                        <Clock size={14} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">{jobData.working_hours || '9:00 - 18:00'}</span>
                                                    </div>
                                                </div>

                                                {(company.rjp_negatives) && (
                                                    <div className="mt-auto bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 relative overflow-hidden">
                                                        <div className="absolute -right-2 -top-2 text-amber-100 transform rotate-12">
                                                            <Building2 size={80} />
                                                        </div>
                                                        <div className="shrink-0 bg-amber-400 text-white text-[10px] font-black px-1.5 py-3 rounded writing-vertical-rl flex items-center justify-center tracking-widest h-full shadow-sm">
                                                            REALITY
                                                        </div>
                                                        <div className="relative z-10 flex-1">
                                                            <p className="text-[10px] font-bold text-amber-800/70 mb-0.5 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                                                入社後のリアルギャップ予防
                                                            </p>
                                                            <p className="text-xs font-bold text-amber-900 leading-snug">
                                                                {company.rjp_negatives}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 pt-4 border-t border-slate-100 md:hidden pr-12">
                                                    <div className="text-center text-xs font-bold text-blue-600">
                                                        詳細を見る
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold mb-4">条件に一致する求人が見つかりませんでした。</p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-bold transition-colors"
                            >
                                検索条件をクリア
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
                reels={activeReels}
                entityName={activeEntity.name}
                entityId={activeEntity.id}
                entityType="job"
                companyId={activeEntity.companyId}
            />
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        }>
            <JobsContent />
        </Suspense>
    );
}
