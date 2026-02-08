"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { Search, MapPin, Briefcase, GraduationCap, MessageSquare, ChevronDown, Filter, CheckCircle, Sparkles, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/appStore';
import { VALUE_CARDS } from '@/lib/constants/analysisData';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearchParams } from 'next/navigation';

type TabType = 'all' | 'liked' | 'scouted';

function ScoutContent() {
    const { users, currentCompanyId, interactions, toggleInteraction, createChat, getMonthlyScoutCount, canSendScout, searchPresets, addSearchPreset, deleteSearchPreset } = useAppStore();
    const searchParams = useSearchParams();
    const initialTab = (searchParams.get('tab') as TabType) || 'all';

    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [presetName, setPresetName] = useState('');
    const [showPresetSave, setShowPresetSave] = useState(false);

    // Scout Modal State
    const [scoutTarget, setScoutTarget] = useState<{ id: string, name: string } | null>(null);
    const [scoutMessage, setScoutMessage] = useState('はじめまして！プロフィールの「愛媛を面白くする」という言葉に惹かれました。ぜひ一度お話ししませんか？');
    const [isSubmittingScout, setIsSubmittingScout] = useState(false);

    const myPresets = useMemo(() =>
        searchPresets.filter(p => p.companyId === currentCompanyId)
        , [searchPresets, currentCompanyId]);

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            toast.error('プリセット名を入力してください');
            return;
        }
        addSearchPreset({
            companyId: currentCompanyId,
            name: presetName,
            query: searchQuery
        });
        setPresetName('');
        setShowPresetSave(false);
    };

    const applyPreset = (query: string) => {
        setSearchQuery(query);
        toast.info('検索条件を適用しました');
    };

    const handleScoutClick = (userId: string, userName: string) => {
        if (!canSendScout(currentCompanyId)) {
            toast.error('月間のスカウト送信上限（10件）に達しました');
            return;
        }
        setScoutTarget({ id: userId, name: userName });
    };

    const handleExecuteScout = async () => {
        if (!scoutTarget) return;
        setIsSubmittingScout(true);

        try {
            // metadata にもメッセージを含めることでアプローチタブに表示させる
            await toggleInteraction('scout', currentCompanyId, scoutTarget.id, { message: scoutMessage });
            await createChat(currentCompanyId, scoutTarget.id, scoutMessage);

            toast.success(`${scoutTarget.name}さんにスカウトを送りました`);
            setScoutTarget(null);
            setScoutMessage('はじめまして！プロフィールの「愛媛を面白くする」という言葉に惹かれました。ぜひ一度お話ししませんか？');
        } catch (error) {
            console.error('Scout failed:', error);
            toast.error('スカウトの送信に失敗しました');
        } finally {
            setIsSubmittingScout(false);
        }
    };

    const handleToggleLike = async (userId: string, userName: string) => {
        await toggleInteraction('like_user', currentCompanyId, userId);
    };

    // Filtering Logic
    const filteredUsers = useMemo(() => {
        // Only show job seekers (student / worker users) and exclude junior/high school students
        let list = users.filter(user =>
            (user.userType === 'student' || user.userType === 'worker') &&
            user.schoolType !== 'junior_high' &&
            user.schoolType !== 'high_school'
        );

        if (activeTab === 'liked') {
            list = list.filter(user =>
                interactions.some(i => i.type === 'like_user' && i.fromId === currentCompanyId && i.toId === user.id)
            );
        } else if (activeTab === 'scouted') {
            list = list.filter(user =>
                interactions.some(i => i.type === 'scout' && i.fromId === currentCompanyId && i.toId === user.id)
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.university?.toLowerCase().includes(query) ||
                user.faculty?.toLowerCase().includes(query) ||
                user.bio?.toLowerCase().includes(query) ||
                user.tags.some(t => t.toLowerCase().includes(query))
            );
        }

        return list;
    }, [users, activeTab, interactions, currentCompanyId, searchQuery]);

    const getCount = (tab: TabType) => {
        const seekerUsers = users.filter(u =>
            u.userType === 'student' &&
            u.schoolType !== 'junior_high' &&
            u.schoolType !== 'high_school'
        );
        if (tab === 'all') return seekerUsers.length;
        if (tab === 'liked') return interactions.filter(i => i.type === 'like_user' && i.fromId === currentCompanyId && seekerUsers.some(u => u.id === i.toId)).length;
        if (tab === 'scouted') return interactions.filter(i => i.type === 'scout' && i.fromId === currentCompanyId && seekerUsers.some(u => u.id === i.toId)).length;
        return 0;
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">スカウト</h2>
                    <p className="text-slate-500 text-sm mt-1">あなたの会社に興味を持っている、または条件に合う人材を探しましょう</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Monthly Scout Limit</span>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-xl font-black ${canSendScout(currentCompanyId) ? 'text-blue-600' : 'text-red-500'}`}>
                                    {10 - getMonthlyScoutCount(currentCompanyId)}
                                </span>
                                <span className="text-xs font-bold text-blue-400">/ 10 残り</span>
                            </div>
                        </div>
                        <div className="w-12 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${canSendScout(currentCompanyId) ? 'bg-blue-500' : 'bg-red-500'}`}
                                style={{ width: `${(getMonthlyScoutCount(currentCompanyId) / 10) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl self-start">
                    {(['all', 'liked', 'scouted'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === tab
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab === 'all' && <Users size={14} />}
                            {tab === 'liked' && <Heart size={14} className={activeTab === tab ? 'text-red-500' : ''} fill={activeTab === tab ? 'currentColor' : 'none'} />}
                            {tab === 'scouted' && <CheckCircle size={14} className={activeTab === tab ? 'text-blue-600' : ''} />}

                            <span>
                                {tab === 'all' ? '候補者を探す' : tab === 'liked' ? '気になる' : 'スカウト済み'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeTab === tab ? 'bg-slate-100 text-slate-600' : 'bg-slate-200/50 text-slate-400'}`}>
                                {getCount(tab)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="キーワードで検索（名前、大学、タグ、自己紹介など）..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPresetSave(!showPresetSave)}
                            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 border ${showPresetSave ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                        >
                            <Sparkles size={18} />
                            条件を保存
                        </button>
                        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                            <Filter size={18} />
                            詳細条件
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showPresetSave && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder="条件の名前を入力（例: 営業志望、ITスキルあり）"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-blue-100 bg-blue-50/30 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                                />
                                <button
                                    onClick={handleSavePreset}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black shadow-sm"
                                >
                                    保存
                                </button>
                                <button
                                    onClick={() => setShowPresetSave(false)}
                                    className="px-4 py-2 text-slate-400 font-bold text-xs"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {myPresets.length > 0 && (
                    <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Presets:</span>
                        {myPresets.map(p => (
                            <div key={p.id} className="flex items-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-full px-3 py-1 gap-2 flex-shrink-0">
                                <button
                                    onClick={() => applyPreset(p.query)}
                                    className="text-[11px] font-black text-slate-700 max-w-[120px] truncate"
                                >
                                    {p.name}
                                </button>
                                <button
                                    onClick={() => deleteSearchPreset(p.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <ChevronDown size={12} className="rotate-45" />
                                    {/* Using ChevronDown rotated as a small delete 'x' replacement or just an icon */}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            const isScouted = interactions.some(i => i.type === 'scout' && i.fromId === currentCompanyId && i.toId === user.id);
                            const isLiked = interactions.some(i => i.type === 'like_user' && i.fromId === currentCompanyId && i.toId === user.id);

                            return (
                                <motion.div
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col h-full"
                                >
                                    {isScouted && (
                                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
                                            <CheckCircle size={12} /> スカウト済
                                        </div>
                                    )}

                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={user.image || getFallbackAvatarUrl(user.id, user.gender)}
                                                        alt={user.name}
                                                        className="w-12 h-12 rounded-full object-cover border border-slate-100"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            if (!target.getAttribute('data-error-tried')) {
                                                                target.setAttribute('data-error-tried', 'true');
                                                                target.src = getFallbackAvatarUrl(user.id, user.gender);
                                                            } else {
                                                                target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'U') + '&background=random';
                                                            }
                                                        }}
                                                    />
                                                    {user.isOnline && (
                                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                        {user.name}
                                                        {user.id === '061fbf87-f36e-4612-80b4-dedc77b55d5e' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md">YOU</span>}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs font-bold text-slate-500">{user.university}</p>
                                                        {user.occupationStatus && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${user.occupationStatus === 'student' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                {user.occupationStatus === 'student' ? '学生' : '社会人'}
                                                            </span>
                                                        )}
                                                        {/* 学生からのいいね検知 */}
                                                        {interactions.some(i => i.type === 'like_company' && i.fromId === user.id && i.toId === currentCompanyId) && (
                                                            <span className="flex items-center gap-0.5 bg-pink-50 text-pink-500 font-black text-[9px] px-1.5 py-0.5 rounded animate-pulse shadow-sm min-w-fit">
                                                                <Heart size={10} fill="currentColor" />
                                                                興味あり
                                                            </span>
                                                        )}
                                                        {/* マッチング表示 */}
                                                        {interactions.some(i => i.type === 'like_company' && i.fromId === user.id && i.toId === currentCompanyId) &&
                                                            interactions.some(i => i.type === 'like_user' && i.fromId === currentCompanyId && i.toId === user.id) && (
                                                                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                                                                    MATCH
                                                                </span>
                                                            )}
                                                    </div>
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
                                            onClick={() => handleToggleLike(user.id, user.name)}
                                            className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${isLiked
                                                ? 'bg-red-50 border-red-200 text-red-500 shadow-inner'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                                            {isLiked ? '保存済み' : '気になる'}
                                        </button>
                                        <button
                                            onClick={() => handleScoutClick(user.id, user.name)}
                                            disabled={isScouted || !canSendScout(currentCompanyId)}
                                            className={`flex-[2] py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isScouted
                                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                : !canSendScout(currentCompanyId)
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95'
                                                }`}
                                        >
                                            <MessageSquare size={16} />
                                            {isScouted ? 'スカウト済' : !canSendScout(currentCompanyId) ? '上限到達' : 'スカウトを送る'}
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                                {activeTab === 'liked' ? <Heart size={40} /> : activeTab === 'scouted' ? <CheckCircle size={40} /> : <Users size={40} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">
                                    {activeTab === 'liked' ? '保存した候補者はまだいません' :
                                        activeTab === 'scouted' ? 'スカウト済みの候補者はまだいません' :
                                            '候補者が見つかりませんでした'}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 font-bold">
                                    {activeTab === 'liked' ? '気になる候補者をチェックして保存しましょう' :
                                        activeTab === 'scouted' ? '条件に合う候補者にスカウトを送ってみましょう' :
                                            '検索条件を変えて試してみてください'}
                                </p>
                                {activeTab !== 'all' && (
                                    <button
                                        onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
                                        className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-black shadow-lg shadow-slate-200"
                                    >
                                        すべての候補者を表示
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Scout Confirmation Modal */}
            <AnimatePresence>
                {scoutTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative border border-slate-100"
                        >
                            <div className="flex flex-col space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                        <Sparkles size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">
                                            {scoutTarget.name}さんにスカウトを送る
                                        </h3>
                                        <p className="text-sm font-bold text-slate-400">メッセージを添えて、あなたへの興味を伝えましょう</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Message</label>
                                    <textarea
                                        value={scoutMessage}
                                        onChange={(e) => setScoutMessage(e.target.value)}
                                        placeholder="メッセージを入力してください..."
                                        className="w-full h-40 p-5 rounded-3xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-800 text-sm leading-relaxed resize-none"
                                    />
                                    <div className="flex justify-between px-1">
                                        <p className="text-[10px] text-slate-300 font-bold">相手のチャット画面に最初のメッセージとして届きます</p>
                                        <p className={`text-[10px] font-bold ${scoutMessage.length > 500 ? 'text-red-500' : 'text-slate-300'}`}>{scoutMessage.length}/500</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <button
                                        onClick={() => setScoutTarget(null)}
                                        className="py-4 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={handleExecuteScout}
                                        disabled={isSubmittingScout || !scoutMessage.trim()}
                                        className={`py-4 rounded-2xl font-black text-white bg-blue-600 border border-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 ${isSubmittingScout || !scoutMessage.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
                                    >
                                        {isSubmittingScout ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles size={18} />
                                                <span>送信する</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ScoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ScoutContent />
        </Suspense>
    );
}
