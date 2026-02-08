"use client";

import React, { useState, useMemo } from 'react';
import { Search, Briefcase, Sparkles, Building2, Play, GraduationCap, X, Check } from 'lucide-react';
import { useAppStore, Attachment } from '@/lib/appStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ItemSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (attachment: Attachment) => void;
    companyId: string;
}

type TabType = 'job' | 'quest' | 'reel' | 'company' | 'course';

export default function ItemSelectorModal({ isOpen, onClose, onSelect, companyId }: ItemSelectorModalProps) {
    const { jobs, companies, courses } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('job');
    const [searchQuery, setSearchQuery] = useState('');

    const company = companies.find(c => c.id === companyId);

    const filteredItems = useMemo(() => {
        let items: any[] = [];
        switch (activeTab) {
            case 'job':
                items = jobs.filter(j => j.companyId === companyId && j.type === 'job');
                break;
            case 'quest':
                items = jobs.filter(j => j.companyId === companyId && j.type === 'quest');
                break;
            case 'reel':
                items = company?.reels || [];
                break;
            case 'company':
                items = company ? [company] : [];
                break;
            case 'course':
                items = courses; // Eラーニングは全社共通/公開されているものと仮定
                break;
        }

        if (!searchQuery) return items;
        return items.filter(item =>
            (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activeTab, jobs, company, courses, companyId, searchQuery]);

    const handleItemSelect = (item: any) => {
        const attachment: Attachment = {
            id: `card_${Date.now()}`,
            type: activeTab,
            url: '#', // We use itemId for rendering
            name: item.title || item.name || 'コンテンツ',
            itemId: item.id
        };
        onSelect(attachment);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">コンテンツを選択</h3>
                            <p className="text-sm font-bold text-slate-400">チャットにカード形式で添付します</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar gap-1">
                        {[
                            { id: 'job', label: '求人', icon: <Briefcase size={16} /> },
                            { id: 'quest', label: 'クエスト', icon: <Sparkles size={16} /> },
                            { id: 'reel', label: '動画', icon: <Play size={16} /> },
                            { id: 'company', label: '会社', icon: <Building2 size={16} /> },
                            { id: 'course', label: 'コース', icon: <GraduationCap size={16} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                        : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="p-4 bg-white border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="キーワードで検索..."
                                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {filteredItems.length > 0 ? (
                            filteredItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => handleItemSelect(item)}
                                    className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                                        <img
                                            src={item.cover_image_url || item.thumbnail || item.image || '/images/defaults/default_job_cover.png'}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-800 truncate mb-1">{item.title || item.name}</h4>
                                        <p className="text-xs font-bold text-slate-400 line-clamp-1">{item.description || item.industry || 'タップして選択'}</p>
                                    </div>
                                    <div className="p-2 rounded-full bg-slate-50 text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <Check size={20} />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                    <Search size={32} />
                                </div>
                                <p className="font-black">対象のアイテムが見つかりません</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
