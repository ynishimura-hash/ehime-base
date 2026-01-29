"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useAppStore } from '@/lib/appStore';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Briefcase, JapaneseYen, Clock, Loader2, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { ReelModal } from '@/components/reels/ReelModal';
import { Reel } from '@/types/shared';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { fetchQuestsAction } from '@/app/admin/actions';
import { QuestCardSkeleton } from '@/components/skeletons/QuestCardSkeleton';

function QuestsContent() {
    const searchParams = useSearchParams();
    const { interactions, toggleInteraction, activeRole, currentUserId } = useAppStore();
    const supabase = createClient();

    // State
    const [quests, setQuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Reel State
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);
    const [activeReels, setActiveReels] = useState<Reel[]>([]);
    const [activeEntity, setActiveEntity] = useState<{ name: string, id: string, companyId?: string }>({ name: '', id: '' });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const fetchedQuests = await fetchQuestsAction();
                if (fetchedQuests.success) {
                    setQuests(fetchedQuests.data as any[]);
                } else {
                    console.error('Fetch error:', fetchedQuests.error);
                    toast.error('クエストの取得に失敗しました');
                }
            } catch (error) {
                console.error('Error fetching quests:', error);
                toast.error('クエストの取得に失敗しました');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);
    const filteredQuests = quests.filter(quest => {
        const matchesSearch = !searchQuery ||
            quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quest.organization.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRegion = selectedRegions.length === 0 ||
            selectedRegions.includes(quest.organization.location);

        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(quest.category);

        let matchesFeatures = true;
        if (selectedFeatures.includes('premium') && !quest.organization.is_premium) matchesFeatures = false;

        return matchesSearch && matchesRegion && matchesCategory && matchesFeatures;
    }).sort((a, b) => {
        // Sort Priority: Premium > Standard
        const aPremium = a.organization?.is_premium ? 1 : 0;
        const bPremium = b.organization?.is_premium ? 1 : 0;
        return bPremium - aPremium;
    });

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

    const isLiked = (questId: string) => {
        return interactions.some(i => i.type === 'like_quest' && i.fromId === currentUserId && i.toId === questId);
    };

    const toggleLike = async (questId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUserId) {
            toast.error('ログインが必要です');
            return;
        }
        await toggleInteraction('like_quest', currentUserId, questId);
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
        setSelectedRegions([]);
        setSelectedCategories([]);
        setSelectedFeatures([]);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto p-4 md:p-6 text-slate-900">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2">
                                <span className="bg-blue-600 text-white p-1.5 rounded-lg"><Briefcase size={20} /></span>
                                クエストを探す
                            </h1>
                            <p className="text-slate-500 font-bold mt-1 text-sm">短期間で企業のリアルを知る体験型求人</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="職種、キーワード、企業名で検索"
                                className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 font-bold text-slate-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${isFilterOpen || selectedRegions.length > 0 || selectedCategories.length > 0 ? 'bg-slate-800 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                            >
                                <Filter size={18} />
                                フィルター
                                {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {isFilterOpen && (
                            <div className="p-4 border-t border-slate-200 bg-white/50 rounded-b-xl space-y-6">
                                <div>
                                    <p className="text-sm font-black text-slate-700 mb-3">エリア</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['松山市', '今治市', '新居浜市', '西条市', '宇和島市'].map(region => (
                                            <button
                                                key={region}
                                                onClick={() => toggleRegion(region)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedRegions.includes(region) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                {region}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-700 mb-3">カテゴリー</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['体験JOB', 'インターンシップ', 'アルバイト', '1day'].map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${selectedCategories.includes(cat) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-700 mb-3">こだわり</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => toggleFeature('premium')}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${selectedFeatures.includes('premium') ? 'bg-yellow-50 border-yellow-400 text-yellow-700 ring-2 ring-yellow-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-md'}`}
                                        >
                                            <ShieldCheck size={14} className={selectedFeatures.includes('premium') ? 'text-yellow-500' : 'text-slate-400'} />
                                            認定企業
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">リセット</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-sm font-bold text-slate-500">{filteredQuests.length}件のクエストが見つかりました</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="h-full">
                                <QuestCardSkeleton />
                            </div>
                        ))
                    ) : filteredQuests.length > 0 ? (
                        filteredQuests.map(quest => (
                            <Link href={`/quests/${quest.id}`} key={quest.id} className="block group">
                                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 relative h-full flex flex-col">
                                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                        <img
                                            src={quest.cover_image_url || quest.organization.cover_image_url || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800'}
                                            alt={quest.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                                                {quest.category}
                                            </span>
                                            {quest.organization.is_premium && (
                                                <span className="bg-yellow-400 text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg">
                                                    ★ PREMIUM
                                                </span>
                                            )}
                                        </div>

                                        <div className="absolute right-4 bottom-4 z-10 group-hover:scale-110 transition-transform">
                                            {/* Show Quest Reels if available, or Company Reels if not? User said strict separation.
                                                If I use quest.reels, and it is empty, icon is hidden.
                                                If I want to show company reels, I should do it on clicking company logo or something.
                                                But usually fallback is nice.
                                                "Quest -> Quest, Company -> Company" implies if I am looking at a quest card, I expect quest content.
                                                However, for "Find by Video", we have labels.
                                                Here, let's stick to strict quest reels. If you want company reels, click company name?
                                                Maybe for now, I will use quest.reels. If empty, the icon won't show.
                                                If the user WANTS to see company reels on the card, they'd have to say so.
                                                But usually "Quest specific video" is key feature.
                                            */}
                                            <ReelIcon
                                                reels={quest.reels || []}
                                                fallbackImage={quest.organization.cover_image_url}
                                                size="md"
                                                onClick={() => {
                                                    // STRICT: Only Quest Reels
                                                    const reelsToShow = quest.reels && quest.reels.length > 0 ? quest.reels : [];
                                                    setActiveReels(reelsToShow);
                                                    setActiveEntity({ name: quest.title, id: quest.id, companyId: quest.organization.id });
                                                    setIsReelModalOpen(true);
                                                }}
                                            />
                                        </div>

                                        <button
                                            onClick={(e) => toggleLike(quest.id, e)}
                                            className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm hover:bg-red-50 hover:scale-110 transition-all"
                                        >
                                            <Heart size={20} className={`transition-colors ${isLiked(quest.id) ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
                                        </button>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3">
                                            <img
                                                src={quest.organization.logo_url || quest.organization.cover_image_url}
                                                className="w-5 h-5 rounded-full object-cover grayscale opacity-70"
                                                alt=""
                                            />
                                            <span className="text-[10px] font-black text-slate-400 truncate tracking-tight uppercase">
                                                {quest.organization.name}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {quest.title}
                                        </h3>

                                        <div className="mt-auto space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">Reward</p>
                                                    <p className="text-xs font-black text-blue-600 flex items-center gap-1">
                                                        <JapaneseYen size={10} />
                                                        {quest.reward || '経験/スキル'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">Location</p>
                                                    <p className="text-xs font-black text-slate-600 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {quest.location || '愛媛県内'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                                    ))}
                                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[8px] font-black text-blue-500">
                                                        +{quest.applicationCount || 0}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-blue-600 font-black text-[10px]">
                                                    DETAIL <ArrowRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-black">クエストが見つかりませんでした</p>
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

function Heart({ size, className }: { size: number, className: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}

export default function QuestsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
            </div>
        }>
            <QuestsContent />
        </Suspense>
    );
}
