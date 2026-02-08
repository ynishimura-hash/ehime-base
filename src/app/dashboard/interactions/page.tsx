"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Heart,
    Sparkles,
    MessageSquare,
    ChevronRight,
    Building2,
    Search,
    Inbox,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type TabType = 'scout' | 'liked';

export default function InteractionsPage() {
    const {
        currentUserId,
        interactions,
        companies,
        createChat,
        activeRole
    } = useAppStore();

    const [activeTab, setActiveTab] = useState<TabType>('scout');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // 企業からのアプローチ（自分宛てのもの）を抽出
    const receivedInteractions = useMemo(() => {
        return interactions.filter(i =>
            i.toId === currentUserId && (i.type === 'like_user' || i.type === 'scout')
        ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }, [interactions, currentUserId]);

    const filteredList = useMemo(() => {
        let list = receivedInteractions.filter(i =>
            activeTab === 'scout' ? i.type === 'scout' : i.type === 'like_user'
        );

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(i => {
                const company = companies.find(c => c.id === i.fromId);
                return (
                    company?.name.toLowerCase().includes(query) ||
                    company?.industry.toLowerCase().includes(query) ||
                    (i.metadata?.message && i.metadata.message.toLowerCase().includes(query))
                );
            });
        }

        return list;
    }, [receivedInteractions, activeTab, searchQuery, companies]);

    const handleStartChat = async (companyId: string) => {
        try {
            const chatId = await createChat(companyId, currentUserId);
            router.push(`/messages?chat=${chatId}`);
        } catch (error) {
            console.error('Failed to start chat:', error);
            toast.error('チャットの開始に失敗しました');
        }
    };

    const getCount = (type: TabType) => {
        return receivedInteractions.filter(i =>
            type === 'scout' ? i.type === 'scout' : i.type === 'like_user'
        ).length;
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">企業からのアプローチ</h1>
                    <p className="text-slate-500 font-bold mt-1">あなたに興味を持っている企業を確認しましょう</p>
                </div>

                <div className="relative group max-w-xs w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="企業名や業界で検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit">
                {(['scout', 'liked'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            relative px-8 py-3 rounded-[1.5rem] text-sm font-black transition-all flex items-center gap-2
                            ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTabInteraction"
                                className="absolute inset-0 bg-blue-600 rounded-[1.5rem] shadow-lg shadow-blue-200"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {tab === 'scout' ? <Sparkles size={16} /> : <Heart size={16} />}
                            {tab === 'scout' ? 'スカウト' : '気になる！'}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {getCount(tab)}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredList.length > 0 ? (
                        filteredList.map((interaction) => {
                            const company = companies.find(c => c.id === interaction.fromId);
                            if (!company) return null;

                            return (
                                <motion.div
                                    key={interaction.id || interaction.timestamp}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Company Info Left */}
                                        <div className="flex-1 flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {company.image ? (
                                                    <img src={company.image} alt={company.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="text-slate-300" size={32} />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-xl font-black text-slate-800">{company.name}</h3>
                                                    {interaction.type === 'scout' && (
                                                        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                                                            Special Scout
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-slate-400">{company.industry} • {company.location}</p>

                                                {interaction.type === 'scout' && interaction.metadata?.message && (
                                                    <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 relative">
                                                        <Sparkles className="absolute -top-2 -right-2 text-blue-400 animate-pulse" size={16} />
                                                        <p className="text-sm font-bold text-blue-800 leading-relaxed italic line-clamp-3">
                                                            「{interaction.metadata.message}」
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Right */}
                                        <div className="flex flex-row md:flex-col justify-end gap-3 mt-4 md:mt-0 min-w-[140px]">
                                            <button
                                                onClick={() => handleStartChat(company.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white font-black py-4 px-6 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                                            >
                                                <MessageSquare size={18} />
                                                <span>話を聞く</span>
                                            </button>
                                            <Link
                                                href={`/companies/${company.id}`}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-black py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                            >
                                                <span>詳細</span>
                                                <ArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Date display */}
                                    <div className="absolute top-6 right-6 text-[10px] font-black text-slate-300">
                                        {interaction.timestamp ? new Date(interaction.timestamp).toLocaleDateString('ja-JP') : ''}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Inbox size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-400">アプローチはまだありません</h3>
                            <p className="text-sm font-bold text-slate-300 mt-2">プロフィールを充実させて、企業からの興味を集めましょう！</p>
                            <Link
                                href="/mypage/edit"
                                className="inline-flex mt-6 bg-slate-100 text-slate-600 font-black px-6 py-3 rounded-2xl hover:bg-slate-200 transition-all text-sm"
                            >
                                プロフィールを編集する
                            </Link>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
