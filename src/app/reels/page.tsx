"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useSearchParams } from 'next/navigation';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { Reel } from '@/lib/dummyData';
import { Film, Play, Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// Helper for YouTube ID
// Helper for YouTube ID
const getYouTubeID = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[8].length === 11) ? match[8] : '';
};


function ReelsContent() {
    const searchParams = useSearchParams();
    const { companies, jobs } = useAppStore();
    const [mediaReels, setMediaReels] = useState<any[]>([]);
    const supabase = createClient();

    // Fetch Media Library
    useEffect(() => {
        const fetchMedia = async () => {
            // 1. Fetch Media
            const { data: mediaData, error: mediaError } = await supabase
                .from('media_library')
                .select('*')
                .order('created_at', { ascending: false });

            if (mediaError) {
                console.error('Error fetching media:', mediaError);
                return;
            }

            // 2. Fetch Organizations (for mapping)
            const { data: orgsData } = await supabase
                .from('organizations')
                .select('id, name, logo_url, location, industry');

            // Map for quick lookup
            const orgMap = new Map(orgsData?.map((o: any) => [o.id, o]) || []);

            if (mediaData) {
                // Transform to Reel format
                const items = mediaData.map((item: any) => {
                    const org = item.organization_id ? orgMap.get(item.organization_id) : null;

                    return {
                        reel: {
                            id: item.id,
                            url: item.type === 'youtube' ? `https://www.youtube.com/embed/${getYouTubeID(item.public_url)}` : item.public_url,
                            title: item.title || item.filename || 'No Title',
                            caption: item.caption,
                            link_url: item.link_url,
                            link_text: item.link_text,
                            likes: 0,
                            comments: 0,
                            shares: 0,
                            type: item.type === 'youtube' ? 'youtube' : 'file'
                        },
                        organization: org,
                        entityName: org?.name || 'Ehime Base',
                        entityId: item.organization_id || item.job_id || 'admin',
                        type: item.organization_id ? 'company' : (item.job_id ? 'job' : 'company'),
                        companyId: item.organization_id
                    };
                });
                setMediaReels(items);
            }
        };
        fetchMedia();
    }, []);

    // Aggregate only Supabase media
    const allReels: { reel: Reel, entityName: string, entityId: string, type: 'company' | 'job', companyId?: string, organization?: any }[] = [...mediaReels];


    // Reel State
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [startIndex, setStartIndex] = useState(0);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, companyId?: string }>({ name: '', id: '' });
    const [activeType, setActiveType] = useState<'company' | 'job'>('company');

    // Filter State
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [hoveredReelIndex, setHoveredReelIndex] = useState<number | null>(null);

    // Initialize from URL
    useEffect(() => {
        const areaParam = searchParams.get('area');
        const industryParam = searchParams.get('industry');

        if (areaParam) {
            const areaMap: Record<string, string> = {
                'chuyo': '中予',
                'toyo': '東予',
                'nanyo': '南予'
            };
            setSelectedArea(areaMap[areaParam] || '');
        }
        if (industryParam) {
            setSelectedIndustry(industryParam);
        }
    }, []);

    // Filter Logic
    const filteredReels = allReels.filter(item => {
        // item will have company information if it came from media_library join
        const company = (item as any).organization || companies.find(c => c.id === item.entityId || c.id === item.companyId);

        const query = searchQuery.toLowerCase();

        // 1. Match either the reel's company info OR the reel's title
        const matchesSearch = !query ||
            item.entityName.toLowerCase().includes(query) ||
            item.reel.title.toLowerCase().includes(query) ||
            company?.location?.toLowerCase().includes(query);

        // 2. Area Filter
        const regionCities: Record<string, string[]> = {
            '中予': ['松山', '伊予', '東温', '久万高原', '松前', '砥部'],
            '東予': ['今治', '新居浜', '西条', '四国中央', '上島'],
            '南予': ['宇和島', '八幡浜', '大洲', '西予', '内子', '伊方', '松野', '鬼北', '愛南']
        };
        const cities = regionCities[selectedArea] || [];
        const matchesArea = !selectedArea ||
            company?.location?.includes(selectedArea) ||
            cities.some((city: string) => company?.location?.includes(city));

        // 3. Industry Filter
        const matchesIndustry = !selectedIndustry || company?.industry === selectedIndustry;

        return matchesSearch && matchesArea && matchesIndustry;
    });

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedArea('');
        setSelectedIndustry('');
    };

    const handleReelClick = (index: number) => {
        // Construct a list of all reels for the modal to swipe through
        const reelsList = allReels.map(item => item.reel);
        setActiveReels(reelsList);
        setStartIndex(index);

        const currentItem = allReels[index];
        setActiveEntity({
            name: currentItem.entityName,
            id: currentItem.entityId,
            companyId: currentItem.companyId
        });
        setActiveType(currentItem.type);

        setIsReelModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
            {/* Unified Header Section */}
            <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                                <Film size={32} className="text-pink-500" />
                                動画で探す
                            </h1>
                            <p className="text-slate-500 font-bold mt-1 text-xs md:text-sm pl-11">
                                企業の雰囲気をショート動画で体験しよう。
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
                                placeholder="キーワード検索 (企業名, 動画タイトル)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-none focus:ring-0 font-bold text-slate-700 text-base placeholder:font-medium placeholder:text-slate-400"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                {(searchQuery || selectedArea || selectedIndustry) && (
                                    <button
                                        onClick={clearFilters}
                                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                                        title="検索条件をクリア"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                                {/* Filter button placeholder - disabled style until filters exist */}
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap shadow-sm border ${isFilterOpen || (selectedArea || selectedIndustry)
                                        ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    <Filter size={18} />
                                    <span className="hidden md:inline">絞り込み</span>
                                    {(selectedArea || selectedIndustry) && (
                                        <span className="bg-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                            {(selectedArea ? 1 : 0) + (selectedIndustry ? 1 : 0)}
                                        </span>
                                    )}
                                    {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Detailed Filters */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <div className="p-4 md:p-6 border-t border-slate-200 bg-white/50 rounded-b-xl space-y-6 mt-2">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Area Filter */}
                                    <div className="flex-1">
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
                                    <div className="flex-1 md:border-l md:border-slate-100 md:pl-6">
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
                                                '医療・福祉'
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
                                </div>
                            </div>
                        </div>

                        {/* Applied Filters Tags */}
                        {(searchQuery || selectedArea || selectedIndustry) && (
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-sm font-bold text-slate-500">{filteredReels.length}本の動画</span>
                </div>

                {filteredReels.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredReels.map((item, index) => (
                            <button
                                key={`${item.type}-${item.entityId}-${item.reel.id}`}
                                onClick={() => handleReelClick(index)}
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
                                className="relative aspect-[9/16] rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all hover:scale-105 border border-slate-100 bg-black"
                            >
                                {item.reel.type === 'file' ? (
                                    <video
                                        src={`${item.reel.url}#t=0.001`}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : (
                                    index === hoveredReelIndex ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${item.reel.url.split('embed/')[1]}?autoplay=1&mute=1&controls=0&start=0&rel=0`}
                                            className="w-full h-full object-cover pointer-events-none"
                                            allow="autoplay; encrypted-media"
                                        />
                                    ) : (
                                        <img
                                            src={`https://img.youtube.com/vi/${item.reel.url.split('embed/')[1]}/0.jpg`}
                                            alt={item.reel.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    )
                                )}

                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                                <div className="absolute center inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                        <Play size={24} className="text-white fill-white" />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                                    <p className="text-white text-xs font-bold line-clamp-1 drop-shadow-md mb-0.5">
                                        {item.entityName}
                                    </p>
                                    <p className="text-white/80 text-[10px] font-medium line-clamp-1">
                                        {item.reel.title}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400 font-bold">
                        動画コンテンツはまだありません。
                    </div>
                )}
            </div>

            {/* 
               Note: The current ReelModal takes a list of reels and an index. 
               However, it also takes single entityName/ID. 
               To support a "Feed" where each reel belongs to a different entity, 
               ReelModal might need refactoring or we pass generic tracking data.
               For this iteration, we'll open the modal with ALL reels, 
               but the modal needs to update the "entity info" displayed at the bottom 
               as the user swipes. 
               
               Currently ReelModal expects `entityName` as a static prop.
               I should update ReelModal to likely accept an array of "ReelItems" which contain metadata,
               OR just accept it works for a single entity for now.
               
               Given the user wants "Find by Video", a "TikTok style feed" is expected.
               I will stick to the grid for now which opens the specific reel. 
               Swiping between reels of *different* companies in the modal would require 
               refactoring ReelModal to accept `items: {reel: Reel, entity: ...}[]`.
               
               I will assume for this step, just opening the specific reel in the modal is defined MVP. 
            */}
            <ReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
                reels={activeReels} // Passing all reels
                initialReelIndex={startIndex}
                entityName={activeEntity.name} // This will be static for the open session unless modal changes it
                entityId={activeEntity.id}
                entityType={activeType}
                companyId={activeEntity.companyId}
            />
        </div>
    );
}

export default function ReelsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                </div>
            </div>
        }>
            <ReelsContent />
        </Suspense>
    );
}
