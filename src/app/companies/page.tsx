"use client";

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { Building2, MapPin, Users, ArrowRight, ShieldCheck, Eye, Briefcase, Search, X, Filter, ChevronUp, ChevronDown, Loader2, Heart } from 'lucide-react';
import { fetchPublicCompaniesAction } from '@/app/admin/actions';
import { CompanyCardSkeleton } from '@/components/skeletons/CompanyCardSkeleton';
// import { JOBS, Reel } from '@/lib/dummyData';
import { Reel } from '@/types/shared';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function CompaniesPage() {
    const supabase = createClient();
    const { companies, jobs, interactions, toggleInteraction, currentUserId, fetchCompanies } = useAppStore();
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedIndustry, setSelectedIndustry] = React.useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    // Reel State
    const [isReelModalOpen, setIsReelModalOpen] = React.useState(false);
    const [activeReels, setActiveReels] = React.useState<Reel[]>([]);
    const [activeEntity, setActiveEntity] = React.useState<{ name: string, id: string }>({ name: '', id: '' });
    // Fetch Companies from Supabase


    React.useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await fetchCompanies();
            } catch (e: any) {
                if (e.name === 'AbortError' || e.message?.includes('aborted') || e.message?.includes('signal is aborted')) return;
                console.error('Failed to fetch companies:', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Derived Data
    const industries = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)));

    // Filtering
    const filteredCompanies = companies.filter(c => {
        const query = searchQuery.toLowerCase();

        // 1. Keyword Search
        const matchesSearch = !query ||
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.location.toLowerCase().includes(query);

        // 2. Industry Filter
        const matchesIndustry = !selectedIndustry || c.industry === selectedIndustry;

        // 3. Feature Filter
        let matchesFeatures = true;
        if (selectedFeatures.length > 0) {
            // AND logic: must match ALL selected features
            if (selectedFeatures.includes('premium') && !c.is_premium) matchesFeatures = false;

            if (selectedFeatures.includes('transparent')) {
                // "Transparent" = Has RJP negatives (Reality Check)
                if (!c.rjpNegatives) matchesFeatures = false;
            }

            if (selectedFeatures.includes('hiring')) {
                const hasJobs = jobs.filter(j => j.companyId === c.id).length > 0; // Removed status check if strict, or kept if valid
                if (!hasJobs) matchesFeatures = false;
            }
        }

        return matchesSearch && matchesIndustry && matchesFeatures;
    }).sort((a, b) => {
        // Sort Priority: Premium > Standard
        const aPremium = a.is_premium ? 1 : 0;
        const bPremium = b.is_premium ? 1 : 0;
        return bPremium - aPremium;
    });

    const isLiked = (companyId: string) => {
        return interactions.some(i => i.type === 'like_company' && i.fromId === currentUserId && i.toId === companyId);
    };

    const toggleFeature = (feature: string) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedIndustry(null);
        setSelectedFeatures([]);
    };

    const activeFilterCount = (selectedIndustry ? 1 : 0) + selectedFeatures.length;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
            {/* Unified Header Section */}
            <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                                <Building2 size={32} className="text-blue-600" />
                                企業を探す
                            </h1>
                            <p className="text-slate-500 font-bold mt-1 text-xs md:text-sm pl-11">
                                愛媛県の魅力的な企業独自の強みや文化を発見。
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
                                placeholder="キーワード検索 (企業名, 事業内容, 地域など)"
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

                        {/* Collapsible Detailed Filters */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="p-4 md:p-6 border-t border-slate-200 bg-white/50 rounded-b-xl space-y-6 mt-2">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Feature Filter */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm font-black text-slate-700">特徴・こだわり</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => toggleFeature('premium')}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedFeatures.includes('premium') ? 'bg-yellow-50 border-yellow-400 text-yellow-700 ring-2 ring-yellow-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                            >
                                                <ShieldCheck size={14} className={selectedFeatures.includes('premium') ? 'text-yellow-500' : 'text-slate-400'} />
                                                認定企業
                                            </button>
                                            <button
                                                onClick={() => toggleFeature('transparent')}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedFeatures.includes('transparent') ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                            >
                                                <Eye size={14} className={selectedFeatures.includes('transparent') ? 'text-amber-500' : 'text-slate-400'} />
                                                リアルな情報あり
                                            </button>
                                            <button
                                                onClick={() => toggleFeature('hiring')}
                                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedFeatures.includes('hiring') ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                            >
                                                <Briefcase size={14} className={selectedFeatures.includes('hiring') ? 'text-blue-500' : 'text-slate-400'} />
                                                募集中
                                            </button>
                                        </div>
                                    </div>

                                    {/* Industry Filter */}
                                    <div className="flex-1 md:border-l md:border-slate-100 md:pl-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm font-black text-slate-700">業界ジャンル</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setSelectedIndustry(null)}
                                                className={`px-4 py-2 text-xs font-bold rounded-full transition-all border shadow-sm hover:-translate-y-0.5 ${!selectedIndustry ? 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                            >
                                                すべて
                                            </button>
                                            {industries.map(ind => (
                                                <button
                                                    key={ind}
                                                    onClick={() => setSelectedIndustry(ind)}
                                                    className={`px-4 py-2 text-xs font-bold rounded-full transition-all border shadow-sm hover:-translate-y-0.5 ${selectedIndustry === ind ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    {ind}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header & Controls removed (moved to sticky) */}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {/* Count */}
                    <div className="col-span-1 sm:col-span-2 xl:col-span-3 flex items-center justify-between px-2 mb-2">
                        <span className="text-sm font-bold text-slate-500">{filteredCompanies.length}社の企業</span>
                    </div>
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-full">
                                <CompanyCardSkeleton />
                            </div>
                        ))
                    ) : filteredCompanies.length > 0 ? (
                        filteredCompanies.map(company => (
                            <div
                                key={company.id}
                                className="block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 group flex flex-col h-full relative"
                            >
                                {/* Clickable Area Overlay */}
                                <Link
                                    href={`/companies/${company.id}`}
                                    className="absolute inset-0 z-0"
                                    aria-label={`${company.name}の詳細を見る`}
                                />

                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleInteraction('like_company', currentUserId, company.id);
                                        }}
                                        className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-sm hover:bg-red-50 hover:scale-110 transition-all group/heart"
                                    >
                                        <Heart
                                            size={20}
                                            className={`transition-colors ${isLiked(company.id) ? 'text-red-500 fill-red-500' : 'text-slate-400 group-hover/heart:text-red-500'}`}
                                        />
                                    </button>
                                </div>

                                {/* Larger Image Area */}
                                <div className="relative aspect-video bg-slate-200 overflow-hidden pointer-events-none">
                                    <img
                                        src={company.cover_image_url || company.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200'}
                                        alt={company.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {company.is_premium && (
                                        <div className="absolute top-4 left-4 bg-yellow-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg backdrop-blur-sm z-10">
                                            ★ PREMIUM
                                        </div>
                                    )}
                                    <div className="absolute right-4 bottom-4 z-20 group-hover:scale-110 transition-transform pointer-events-auto">
                                        <ReelIcon
                                            reels={company.reels || []}
                                            fallbackImage={company.cover_image_url || '/images/defaults/company_cover.jpg'}
                                            size="md"
                                            onClick={() => {
                                                setActiveReels(company.reels || []);
                                                setActiveEntity({ name: company.name, id: company.id });
                                                setIsReelModalOpen(true);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col pointer-events-none">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {company.name}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                                                {company.industry}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                                                <MapPin size={10} />
                                                {company.location}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {company.description}
                                    </p>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                                        <span className="group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                            詳細を見る <ArrowRight size={12} />
                                        </span>
                                        {company.employeeCount && (
                                            <div className="flex items-center gap-1">
                                                <Users size={12} />
                                                {company.employeeCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20">
                            <p className="text-slate-400 font-bold">条件に一致する企業が見つかりませんでした。</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedIndustry(null); }}
                                className="mt-4 text-blue-600 font-bold hover:underline"
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
                entityType="company"
            />
        </div>
    );
}
