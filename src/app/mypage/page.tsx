"use client";

import React from 'react';
import { User, Settings, LogOut, Sparkles, CircleDollarSign, Target, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

import Link from 'next/link';
import { calculateDayMasterIndex, JIKKAN, JIKKAN_READING, JIKKAN_ELEMENTS, getDailyFortune } from '@/lib/fortune';
import { useGameStore } from '@/lib/gameStore';
import { Trophy, Swords, ArrowRight } from 'lucide-react';

const DEMO_USER_ID = '061fbf87-f36e-4612-80b4-dedc77b55d5e';

export default function MyPage() {
    const { users, currentUserId } = useAppStore();
    const { isInitialized, stats } = useGameStore();

    // Demo Mode: If admin or user not found, show Yuji's data
    // Improved migration: if currentUserId is 'u_yuji', treat as DEMO_USER_ID
    const effectiveId = currentUserId === 'u_yuji' ? DEMO_USER_ID : currentUserId;
    const currentUser = users.find(u => u.id === effectiveId) ||
        (currentUserId === 'u_admin' ? users.find(u => u.id === DEMO_USER_ID) : undefined);

    if (!currentUser) return <div className="p-10 text-center font-bold text-slate-400">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="bg-white p-6 pb-10 rounded-b-[2rem] shadow-sm mb-6">
                <div className="flex flex-col items-center">
                    <img
                        src={currentUser.image}
                        alt={currentUser.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md mb-4"
                    />
                    <h1 className="text-xl font-black text-slate-800 mb-1">{currentUser.name}</h1>
                    <p className="text-sm text-slate-500 font-bold">{currentUser.university || '所属なし'}</p>
                </div>
            </div>

            <div className="p-4 max-w-md mx-auto">
                {/* Game Status Widget (Show if initialized) */}
                {isInitialized ? (
                    <Link href="/game" className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-6 text-white shadow-xl mb-6 flex items-center justify-between group relative overflow-hidden">
                        <div className="absolute right-[-5%] bottom-[-10%] opacity-10 rotate-12">
                            <Trophy size={140} />
                        </div>
                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-indigo-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Job Hunt active</span>
                                <span className="text-[10px] font-bold text-indigo-300">Level {stats.level}</span>
                            </div>
                            <div>
                                <h3 className="font-black text-lg leading-tight">就活RPG: 冒険の続きへ</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">所持金: {stats.money.toLocaleString()} 円 / 技術: {stats.skill}</p>
                            </div>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-indigo-600 transition-all z-10">
                            <Swords size={24} />
                        </div>
                    </Link>
                ) : null}

                {/* Success Mode Widget */}
                <Link href="/dashboard/success" className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl mb-6 flex items-center justify-between group relative overflow-hidden ring-2 ring-indigo-500/20">
                    <div className="absolute right-[-5%] top-[-10%] opacity-20">
                        <Target size={120} className="text-indigo-600" />
                    </div>
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Master Dashboard</span>
                        </div>
                        <h3 className="font-black text-lg italic tracking-tighter">SUCCESS MODE</h3>
                        <p className="text-[10px] font-bold text-slate-500">資質・スキル・未来の可視化</p>
                    </div>
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-all z-10">
                        <Zap size={24} className="text-yellow-400" />
                    </div>
                </Link>

                {/* Daily Fortune Widget */}
                {currentUser.birthDate ? (
                    (() => {
                        const index = calculateDayMasterIndex(currentUser.birthDate);
                        const stem = JIKKAN[index];
                        const daily = getDailyFortune(stem);
                        return (
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-200 mb-6 relative overflow-hidden">
                                <div className="absolute right-[-10%] top-[-10%] opacity-10">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                                                Today's Fortune
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black opacity-60 italic">
                                            {JIKKAN_READING[stem]}の{JIKKAN_ELEMENTS[stem]}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-black shrink-0">
                                            {stem}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white/70 mb-1">今日のアドバイス</p>
                                            <p className="font-bold leading-tight">{daily.advice}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-tighter mb-1">Lucky Color</p>
                                            <p className="text-xs font-black">{daily.luckyColor}</p>
                                        </div>
                                        <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
                                            <p className="text-[9px] font-black text-white/50 uppercase tracking-tighter mb-1">Lucky Number</p>
                                            <p className="text-xs font-black">{daily.luckyNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <Link href="/analysis" className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-6 text-white shadow-xl mb-6 flex items-center justify-between group">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">New Feature</p>
                            <h3 className="font-black text-lg text-white">資質診断を完了する</h3>
                            <p className="text-[10px] font-bold text-slate-400">毎日の運勢とアドバイスが届きます</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl group-hover:bg-blue-600 transition-colors">
                            <Sparkles size={24} />
                        </div>
                    </Link>
                )}
            </div>

            <div className="p-4 max-w-md mx-auto space-y-3">
                <Link href="/mypage/edit" className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                        <User size={20} />
                    </div>
                    <div className="flex-1 font-bold text-slate-700">プロフィール編集</div>
                    <div className="text-slate-400">→</div>
                </Link>

                <Link href="/analysis" className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Sparkles size={20} />
                    </div>
                    <div className="flex-1 font-bold text-slate-700">自己分析・資質診断</div>
                    <div className="text-slate-400">→</div>
                </Link>

                <Link href="/game" className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                        <Swords size={20} />
                    </div>
                    <div className="flex-1 font-bold text-slate-700">就活RPG（シミュレーション）</div>
                    <div className="text-indigo-400 font-bold text-xs">New!</div>
                    <div className="text-slate-400">→</div>
                </Link>

                <Link href="/money-simulation" className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                        <CircleDollarSign size={20} />
                    </div>
                    <div className="flex-1 font-bold text-slate-700">ライフプラン・シミュレーション</div>
                    <div className="text-slate-400">→</div>
                </Link>

                <Link href="/settings" className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                        <Settings size={20} />
                    </div>
                    <div className="flex-1 font-bold text-slate-700">設定</div>
                    <div className="text-slate-400">→</div>
                </Link>
                <div
                    onClick={async () => {
                        const { logout } = useAppStore.getState();
                        await logout();
                        window.location.replace('/');
                    }}
                    className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors text-red-500"
                >
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                        <LogOut size={20} />
                    </div>
                    <div className="flex-1 font-bold">ログアウト</div>
                </div>
            </div>
        </div>
    );
}
