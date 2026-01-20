"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { Map, ArrowRight, Wallet, Clock, Info, Search, Filter, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Job, Reel } from '@/lib/dummyData';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';

function QuestsContent() {
    const searchParams = useSearchParams();
    const { jobs, companies } = useAppStore();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Initialize area and industry filters from URL parameters
    useEffect(() => {
        const areaParam = searchParams.get('area');
        const industryParam = searchParams.get('industry');

        if (areaParam) {
            const areaMap: { [key: string]: string } = {
                'chuyo': '中予',
                'toyo': '東予',
                'nanyo': '南予'
            };
            const regionName = areaMap[areaParam];
            if (regionName && !selectedRegions.includes(regionName)) {
                setSelectedRegions([regionName]);
            }
        }

        if (industryParam && !selectedCategories.includes(industryParam)) {
            // Check if industryParam is one of the standardized industries
            setSelectedCategories([industryParam]);
        }
    }, []);

    // Reel State
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, companyId?: string }>({ name: '', id: '' });

    // Filter only quests
    const allQuests = jobs.filter(j => j.type === 'quest');

    // Extract unique filter options
    const allRegions = ['中予', '東予', '南予'];
    const allCategories = ['新卒', '中途', 'アルバイト', '体験JOB', 'インターンシップ', '会社説明会', 'IT・システム開発', '製造・エンジニアリング', 'サービス・観光・飲食店', '農業・一次産業', '物流・運送', '医療・福祉'];

    const toggleRegion = (region: string) => {
        if (selectedRegions.includes(region)) {
            setSelectedRegions(selectedRegions.filter(r => r !== region));
        } else {
            setSelectedRegions([...selectedRegions, region]);
        }
    };

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedRegions([]);
        setSelectedCategories([]);
    };

    // Filter Logic
    const filteredQuests = allQuests.filter(quest => {
        const matchesSearch =
            quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            companies.find(c => c.id === quest.companyId)?.name.toLowerCase().includes(searchQuery.toLowerCase());

        const regionCities: Record<string, string[]> = {
            '中予': ['松山', '伊予', '東温', '久万高原', '松前', '砥部'],
            '東予': ['今治', '新居浜', '西条', '四国中央', '上島'],
            '南予': ['宇和島', '八幡浜', '大洲', '西予', '内子', '伊方', '松野', '鬼北', '愛南']
        };

        const matchesRegion = selectedRegions.length === 0 || selectedRegions.some(region => {
            if (quest.location?.includes(region)) return true;
            const cities = regionCities[region] || [];
            return cities.some(city => quest.location?.includes(city));
        });

        // Match either the quest's category OR the company's industry
        const company = companies.find(c => c.id === quest.companyId);
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(quest.category) ||
            (company && selectedCategories.includes(company.industry));

        return matchesSearch && matchesRegion && matchesCategory;
    });

    const activeFilterCount = selectedRegions.length + selectedCategories.length;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
            {/* Unified Header Section */}
            <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                                <Map size={32} className="text-blue-600" />
                                クエストを探す
                            </h1>
                            <p className="text-slate-500 font-bold mt-1 text-xs md:text-sm pl-11">
                                体験型ジョブや短期プロジェクトに参加して、スキルと報酬を手に入れよう。
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
                                placeholder="キーワードで検索 (例: 農業, イベント, スタッフ)..."
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
                                {selectedRegions.length > 0 && selectedRegions.map(region => (
                                    <span key={region} className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-md border border-amber-100">
                                        エリア: {region}
                                        <X size={10} className="cursor-pointer" onClick={() => toggleRegion(region)} />
                                    </span>
                                ))}
                                {selectedCategories.length > 0 && selectedCategories.map(cat => (
                                    <span key={cat} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black rounded-md border border-slate-200">
                                        {cat}
                                        <X size={10} className="cursor-pointer" onClick={() => toggleCategory(cat)} />
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
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Region Filter */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm font-black text-slate-700">エリア</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {allRegions.map(region => (
                                                <button
                                                    key={region}
                                                    onClick={() => toggleRegion(region)}
                                                    className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedRegions.includes(region)
                                                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                        }`}
                                                >
                                                    {region}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category Filter */}
                                    <div className="flex-1 md:border-l md:border-slate-100 md:pl-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-sm font-black text-slate-700">カテゴリ</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {allCategories.map(category => (
                                                <button
                                                    key={category}
                                                    onClick={() => toggleCategory(category)}
                                                    className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedCategories.includes(category)
                                                        ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md'
                                                        }`}
                                                >
                                                    {category}
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

            <div className="p-4 md:p-8 max-w-4xl mx-auto">


                {/* Results Count */}
                < div className="mb-4 text-slate-500 text-sm font-bold" >
                    {filteredQuests.length}件のクエストが見つかりました
                </div >

                <div className="grid gap-4">
                    {filteredQuests.map(quest => {
                        const company = companies.find(c => c.id === quest.companyId);
                        return (
                            <Link
                                href={`/jobs/${quest.id}`} // Quests are jobs in the data model
                                key={quest.id}
                                className="block bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 group relative"
                            >
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 transition-transform group-hover:scale-110">
                                    <ReelIcon
                                        reels={company?.reels || []}
                                        fallbackImage={company?.image}
                                        onClick={() => {
                                            setActiveReels(company?.reels || []);
                                            setActiveEntity({ name: quest.title, id: quest.id, companyId: company?.id });
                                            setIsReelModalOpen(true);
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-start mb-3 pr-36">
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                        {quest.category}
                                    </span>
                                    {quest.reward && (
                                        <span className="flex items-center gap-1 text-slate-800 font-bold text-sm bg-yellow-100 px-3 py-1 rounded-full text-yellow-800">
                                            <Wallet size={14} />
                                            {quest.reward}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {quest.title}
                                </h3>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-4">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${company?.logoColor || 'bg-slate-400'}`}>
                                        {company?.name.slice(0, 1) || 'C'}
                                    </div>
                                    {company?.name}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Info size={16} className="text-slate-400" />
                                        <span className="line-clamp-1">{quest.description}</span>
                                    </div>
                                    {quest.workingHours && (
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Clock size={16} className="text-slate-400" />
                                            <span>{quest.workingHours}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end text-blue-600 text-sm font-bold gap-1 mt-2">
                                    詳細を見る <ArrowRight size={16} />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {
                    filteredQuests.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p className="font-bold">条件に一致するクエストが見つかりませんでした。</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-blue-600 hover:underline text-sm font-bold"
                            >
                                条件をクリアして全件表示
                            </button>
                        </div>
                    )
                }
            </div >

            <ReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
                reels={activeReels}
                entityName={activeEntity.name}
                entityId={activeEntity.id}
                entityType="job" // Quests are internally job structures
                companyId={activeEntity.companyId}
            />
        </div >
    );
}

export default function QuestsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        }>
            <QuestsContent />
        </Suspense>
    );
}
