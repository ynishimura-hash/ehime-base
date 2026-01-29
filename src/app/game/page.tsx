"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type GameStats } from '@/lib/gameStore';
import Link from 'next/link';
import {
    Trophy, ArrowRight, Calendar, CircleDollarSign,
    Briefcase, Coffee, LayoutDashboard, Sparkles, Zap, AlertCircle,
    Clock, Star, Wrench, Play, Smile, UserCircle, Search, Swords, Book,
    Users, Handshake, ShoppingBag, Backpack, Target, Settings, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import NovelPart from '@/components/game/NovelPart';
import QuizPart from '@/components/game/QuizPart';
import ActionGame from '@/components/game/ActionGame';
import ActionMenuPart from '@/components/game/ActionMenuPart';
import JobSelectPart from '@/components/game/JobSelectPart';
import IzakayaGame from '@/components/game/minigames/IzakayaGame';
import PlaySelectPart from '@/components/game/PlaySelectPart';
import SNSGame from '@/components/game/minigames/SNSGame';
import ReportGame from '@/components/game/minigames/ReportGame';
import InterviewBattle from '@/components/game/battle/InterviewBattle';
import Image from 'next/image';

export default function GameDashboard() {
    // ... (previous imports)
    const {
        stats, calendar, playerName, isInitialized, gameMode,
        initGame, setGameMode, setActionType
    } = useGameStore();

    // ... (init logic)

    if (!isInitialized) {
        // ... (intro render)
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -top-48 -left-48" />
                <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -bottom-48 -right-48" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-16 max-w-xl w-full text-center space-y-10 shadow-2xl relative z-10"
                >
                    <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
                        <Trophy size={56} />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-tight">
                            就活RPG <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Ehime Edition</span>
                        </h1>
                        <p className="text-slate-300 font-bold text-lg">
                            あなたの就活ストーリーが今、始まります。<br />
                            14ヶ月の道のりを、自分らしく駆け抜けよう。
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="text-left space-y-3">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] ml-6 block">
                                プレイヤー名
                            </label>
                            <input
                                type="text"
                                placeholder="名前を入力してください"
                                className="w-full px-10 py-6 bg-white/10 border-2 border-white/20 focus:border-blue-400 rounded-[2.5rem] font-black text-2xl text-white transition-all outline-none placeholder:text-white/40 focus:bg-white/20"
                                id="playerNameInput"
                                defaultValue="まさる"
                            />
                        </div>

                        <button
                            onClick={() => {
                                const val = (document.getElementById('playerNameInput') as HTMLInputElement).value;
                                initGame(val || 'まさる');
                                toast.success('物語が始まりました！', {
                                    style: {
                                        background: '#1e293b',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }
                                });
                            }}
                            className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 hover:bg-blue-500 transition-all active:scale-95 shadow-2xl shadow-blue-600/20 text-xl"
                        >
                            冒険を始める <ArrowRight size={24} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (gameMode === 'novel') return <NovelPart />;
    if (gameMode === 'quiz') return <QuizPart />;
    if (gameMode === 'action') return <ActionGame />;
    if (gameMode === 'action_menu') return <ActionMenuPart />;
    if (gameMode === 'job_select') return <JobSelectPart />;
    if (gameMode === 'izakaya') return <IzakayaGame />;
    if (gameMode === 'play_select') return <PlaySelectPart />;
    if (gameMode === 'sns') return <SNSGame />;
    if (gameMode === 'report') return <ReportGame />;
    if (gameMode === 'battle') return <InterviewBattle />;

    const handleAction = (type: string) => {
        if (stats.stamina < 20 && type !== 'rest') {
            toast.error('体力が足りません！休養しましょう。');
            return;
        }

        setActionType(type);

        switch (type) {
            case 'study':
                setGameMode('quiz');
                break;
            case 'work':
                setGameMode('job_select');
                break;
            case 'play':
                setGameMode('play_select');
                break;
            default:
                setGameMode('action_menu');
                break;
        }
    };

    const getRank = (val: number) => {
        if (val >= 100) return 'S';
        if (val >= 80) return 'A';
        if (val >= 60) return 'B';
        if (val >= 40) return 'C';
        if (val >= 20) return 'D';
        if (val >= 10) return 'E';
        return 'G';
    };

    return (
        <div className="h-screen w-full bg-[#111] flex justify-center text-slate-800 font-sans overflow-hidden">
            <div className="w-full max-w-[430px] h-full relative bg-white shadow-2xl overflow-hidden flex flex-col">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/game/bg/room_strategy.png"
                        alt="room"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-white/10" />
                </div>

                {/* Top Status Bar (Floating) */}
                <header className="relative z-20 p-2 space-y-2">
                    {/* Header Row: Date & Global Icons */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-md border border-slate-200/50">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                            <div className="text-sm font-black tracking-tight flex items-center gap-1">
                                {calendar.year}年 {calendar.month}月 {calendar.week}週目 | 所持金: {stats.money.toLocaleString()} 円
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-emerald-600 transition-colors" onClick={() => toast.info('ショップは準備中です')}><Globe size={14} /></div>
                                <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-orange-600 transition-colors" onClick={() => toast.info('持ち物は準備中です')}><Backpack size={14} /></div>
                                <div className="w-7 h-7 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-slate-700 transition-colors" onClick={() => toast.info('設定機能')}><Settings size={14} /></div>
                            </div>
                        </div>

                        {/* Stats Grid - Vertical Layout for Mobile Compactness */}
                        <div className="grid grid-cols-6 gap-1 items-start">
                            <RankStat label="知識" value={stats.knowledge} rank={getRank(stats.knowledge)} />
                            <RankStat label="忍耐力" value={stats.patience} rank={getRank(stats.patience)} />
                            <RankStat label="対応力" value={stats.adaptability} rank={getRank(stats.adaptability)} />
                            <RankStat label="魅力" value={stats.charm} rank={getRank(stats.charm)} />
                            <RankStat label="スキル" value={stats.skill} rank={getRank(stats.skill)} />

                            {/* Overall Rank (Rightmost) */}
                            <div className="flex flex-col items-center border-l border-slate-100 pl-1">
                                <span className="text-[8px] font-bold text-slate-500 mb-0.5">総合力</span>
                                <div className="font-black text-3xl text-slate-400">{getRank(Math.floor((stats.knowledge + stats.patience + stats.adaptability + stats.charm + stats.skill) / 5))}</div>
                            </div>
                        </div>

                        {/* Bars Row & Condition */}
                        <div className="flex items-center gap-3 mt-3 px-1">
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-600 w-8">体力</span>
                                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.stamina / stats.maxStamina) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-slate-600 w-8">ストレス</span>
                                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-red-400 to-red-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(stats.stress / stats.maxStress) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Condition Face (Compact) */}
                            <div className="flex flex-col items-center pl-2 border-l border-slate-100">
                                <span className="text-[8px] font-bold text-slate-400 mb-0.5">調子</span>
                                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-9 h-9 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white">
                                    {stats.stress > 80 ? '😫' : stats.stress > 50 ? '😐' : '😐'}
                                </div>
                                <span className="text-[9px] font-black text-slate-700 mt-0.5">普通</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area (Character & Buttons) */}
                <div className="flex-1 relative z-10 flex flex-col">
                    {/* Action Grid (Centered Upper) */}
                    <div className="px-4 py-6 mt-2">
                        <div className="grid grid-cols-4 gap-2.5 drop-shadow-2xl">
                            {/* Row 1 */}
                            <GridButton color="bg-[#00A0E9]" label="本を" subLabel="読む" onClick={() => handleAction('study')} />
                            <GridButton color="bg-[#00A0E9]" label="企業" subLabel="を知る" onClick={() => handleAction('research')} />
                            <GridButton color="bg-[#7CB342]" label="自己" subLabel="分析" onClick={() => handleAction('analyze')} />
                            <GridButton color="bg-[#00A0E9]" label="結果" onClick={() => toast.info('結果画面は準備中です')} />

                            {/* Row 2 */}
                            <GridButton color="bg-[#F57F17]" label="バイト" onClick={() => handleAction('work')} />
                            <GridButton color="bg-[#F5F5F5]" textColor="text-slate-700" label="休む" onClick={() => handleAction('rest')} />
                            <GridButton color="bg-[#EC407A]" label="遊ぶ" onClick={() => handleAction('play')} />
                            <GridButton color="bg-[#212121]" label="マイ" subLabel="ページ" onClick={() => window.location.href = '/mypage'} />
                        </div>
                    </div>

                    {/* Character & Proceed Button Zone */}
                    <div className="flex-1 relative">
                        {/* Character (Bottom Left) */}
                        <div className="absolute bottom-[-20px] left-[-30px] w-[280px] h-[360px] z-10">
                            <Image
                                src={`/game/chara/mc/male.png`}
                                alt="Character"
                                fill
                                className="object-contain object-bottom drop-shadow-xl"
                            />
                        </div>

                        {/* Proceed Button (Bottom Right) */}
                        <div className="absolute bottom-6 right-4 z-20">
                            <button
                                onClick={() => setGameMode('battle')}
                                className="bg-gradient-to-b from-[#333] to-[#111] text-white pl-8 pr-8 py-4 rounded-xl font-bold text-lg border-2 border-[#555] shadow-xl active:scale-95 transition-transform flex flex-col items-center cursor-pointer hover:border-blue-500"
                            >
                                <span className="text-sm text-gray-400 mb-0.5">NEXT PHASE</span>
                                <span className="text-xl">面接へ進む</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function RankStat({ label, value, rank }: { label: string, value: number, rank: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold text-slate-500 mb-0.5">{label}</span>
            <div className="font-black text-2xl text-slate-400 leading-none mb-0.5">{rank}</div>
            <span className="text-[9px] font-bold text-slate-800">{value}</span>
        </div>
    );
}

function GridButton({ color, textColor = 'text-white', label, subLabel, onClick }: { color: string, textColor?: string, label: string, subLabel?: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`${color} ${textColor} aspect-square rounded-[1rem] shadow-lg border-b-[3px] border-black/10 active:border-b-0 active:translate-y-[3px] transition-all flex flex-col items-center justify-center p-1 leading-tight`}
        >
            <span className="font-bold text-md drop-shadow-sm">{label}</span>
            {subLabel && <span className="font-bold text-md drop-shadow-sm">{subLabel}</span>}
        </button>
    );
}
