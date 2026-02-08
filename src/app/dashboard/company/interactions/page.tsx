"use client";

import React, { useState, useMemo } from 'react';
import { Heart, Sparkles, MessageSquare, Briefcase, GraduationCap, ChevronRight, User, Search } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import Link from 'next/link';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';

type TabType = 'interested' | 'liked' | 'scouted';

export default function CompanyInteractionsPage() {
    const { users, interactions, currentCompanyId, createChat } = useAppStore();
    const [activeTab, setActiveTab] = useState<TabType>('interested');
    const [searchQuery, setSearchQuery] = useState('');

    // ロジック: 自分たちに「いいね」してくれたユーザー（学生・社会人）
    const interestedUsers = useMemo(() => {
        return users.filter(user =>
            (user.userType === 'student' || user.userType === 'worker') &&
            interactions.some(i => i.type === 'like_company' && i.fromId === user.id && i.toId === currentCompanyId)
        );
    }, [users, interactions, currentCompanyId]);

    // ロジック: 自分たちが「いいね（保存）」したユーザー
    const likedUsers = useMemo(() => {
        return users.filter(user =>
            (user.userType === 'student' || user.userType === 'worker') &&
            interactions.some(i => i.type === 'like_user' && i.fromId === currentCompanyId && i.toId === user.id)
        );
    }, [users, interactions, currentCompanyId]);

    // ロジック: 自分たちが「スカウト」したユーザー
    const scoutedUsers = useMemo(() => {
        return users.filter(user =>
            (user.userType === 'student' || user.userType === 'worker') &&
            interactions.some(i => i.type === 'scout' && i.fromId === currentCompanyId && i.toId === user.id)
        );
    }, [users, interactions, currentCompanyId]);

    const displayUsers = useMemo(() => {
        let list: any[] = [];
        if (activeTab === 'interested') list = interestedUsers;
        else if (activeTab === 'liked') list = likedUsers;
        else if (activeTab === 'scouted') list = scoutedUsers;

        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.university?.toLowerCase().includes(q) ||
            u.bio?.toLowerCase().includes(q)
        );
    }, [activeTab, interestedUsers, likedUsers, scoutedUsers, searchQuery]);

    // マッチング判定（相互いいね）
    const isMatched = (userId: string) => {
        const studentLikedMe = interactions.some(i => i.type === 'like_company' && i.fromId === userId && i.toId === currentCompanyId);
        const myCompanyLikedStudent = interactions.some(i => i.type === 'like_user' && i.fromId === currentCompanyId && i.toId === userId);
        return studentLikedMe && myCompanyLikedStudent;
    };

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h2 className="text-2xl font-black text-slate-800">アプローチ管理</h2>
                <p className="text-slate-500 text-sm mt-1">学生からのリアクションや、過去のスカウト履歴を確認できます</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-full md:w-fit">
                <button
                    onClick={() => setActiveTab('interested')}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'interested'
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Heart size={18} fill={activeTab === 'interested' ? 'currentColor' : 'none'} className={activeTab === 'interested' ? 'text-pink-400' : ''} />
                    興味あり
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'interested' ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                        {interestedUsers.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('liked')}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'liked'
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Heart size={18} fill={activeTab === 'liked' ? 'currentColor' : 'none'} className={activeTab === 'liked' ? 'text-red-400' : ''} />
                    保存済み
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'liked' ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                        {likedUsers.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('scouted')}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'scouted'
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Sparkles size={18} fill={activeTab === 'scouted' ? 'currentColor' : 'none'} />
                    スカウト済み
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'scouted' ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                        {scoutedUsers.length}
                    </span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="名前、大学名などで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white focus:ring-2 focus:ring-slate-900/5 font-bold text-slate-800 shadow-sm"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayUsers.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <img
                                    src={user.image || getFallbackAvatarUrl(user.id, user.gender)}
                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50"
                                    alt=""
                                />
                                {isMatched(user.id) && (
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg animate-bounce">
                                        MATCH!
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-black text-slate-800 truncate">{user.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${user.occupationStatus === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {user.occupationStatus === 'student' ? '学生' : '社会人'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 text-xs font-bold mb-3">
                                    <div className="flex items-center gap-1">
                                        <GraduationCap size={14} />
                                        {user.university || '未設定'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Briefcase size={14} />
                                        {user.faculty || '未設定'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl">
                            <p className="text-xs text-slate-500 font-bold line-clamp-2 leading-relaxed italic">
                                "{user.bio || '自己紹介がまだ設定されていません'}"
                            </p>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <Link
                                href={`/dashboard/company/scout?id=${user.id}`}
                                className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <User size={14} />
                                プロフィール
                            </Link>
                            <button
                                onClick={() => createChat(currentCompanyId, user.id)}
                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                            >
                                <MessageSquare size={14} />
                                メッセージを送る
                            </button>
                        </div>
                    </div>
                ))}

                {displayUsers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <User size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-slate-600">表示できる学生がいません</h3>
                        <p className="text-sm text-slate-400 mt-1">条件を変えて検索するか、スカウト活動を続けてみましょう</p>
                    </div>
                )}
            </div>
        </div>
    );
}
