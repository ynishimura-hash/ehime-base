"use client";

import React, { useState } from 'react';
import { Search, MapPin, Briefcase, GraduationCap, MessageSquare, ChevronDown, Filter, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/appStore';
import { VALUE_CARDS } from '@/lib/constants/analysisData';

export default function ScoutPage() {
    const { users, currentCompanyId, interactions, addInteraction, createChat } = useAppStore();
    const [scoutedIds, setScoutedIds] = useState<string[]>([]);

    const handleScout = (userId: string, userName: string) => {
        // 1. Record interaction
        addInteraction({
            type: 'scout',
            fromId: currentCompanyId,
            toId: userId,
            metadata: { message: 'スカウトを送りました' }
        });

        // 2. Create Chat Thread (Mock sending a message)
        createChat(currentCompanyId, userId, 'はじめまして！プロフィールの「愛媛を面白くする」という言葉に惹かれました。ぜひ一度お話ししませんか？');

        setScoutedIds(prev => [...prev, userId]);
        toast.success(`${userName}さんにスカウトを送りました`);
    };

    const handleLike = (userId: string, userName: string) => {
        addInteraction({
            type: 'like_user',
            fromId: currentCompanyId,
            toId: userId,
        });
        toast.success(`${userName}さんを「気になる」リストに追加しました`);
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h2 className="text-2xl font-black text-slate-800">スカウト</h2>
                <p className="text-slate-500 text-sm mt-1">あなたの会社に興味を持っている、または条件に合う人材を探しましょう</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="キーワードで検索（例：エンジニア、営業、Uターンなど）"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                    />
                </div>
                {/* ... existing filter buttons ... */}
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => {
                    const isScouted = scoutedIds.includes(user.id) || interactions.some(i => i.type === 'scout' && i.fromId === currentCompanyId && i.toId === user.id);
                    const isLiked = interactions.some(i => i.type === 'like_user' && i.fromId === currentCompanyId && i.toId === user.id);

                    return (
                        <div key={user.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col h-full">
                            {isScouted && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                                    <CheckCircle size={12} /> スカウト済
                                </div>
                            )}

                            <div className="p-6 flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={user.image} alt={user.name} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                                            {user.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                {user.name}
                                                {user.id === '061fbf87-f36e-4612-80b4-dedc77b55d5e' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">YOU</span>}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-500">{user.university}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {user.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                        {user.publicValues?.map(valId => {
                                            const card = VALUE_CARDS.find(c => c.id === valId);
                                            return card ? (
                                                <span key={valId} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-md border border-indigo-100 flex items-center gap-1">
                                                    <Sparkles size={10} /> {card.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <GraduationCap size={14} />
                                            {user.faculty}
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium line-clamp-3 leading-relaxed">
                                            {user.bio}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                                <button
                                    onClick={() => handleLike(user.id, user.name)}
                                    disabled={isLiked}
                                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-colors ${isLiked
                                        ? 'bg-pink-50 border-pink-200 text-pink-500'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                >
                                    {isLiked ? '保存済み' : '気になる'}
                                </button>
                                <button
                                    onClick={() => handleScout(user.id, user.name)}
                                    disabled={isScouted}
                                    className={`flex-[2] py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isScouted
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    <MessageSquare size={16} />
                                    {isScouted ? '送信済み' : 'スカウトを送る'}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
