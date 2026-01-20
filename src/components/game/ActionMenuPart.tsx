'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type GameStats } from '@/lib/gameStore';
import { Sparkles, ArrowRight, Zap, TrendingUp, Search, Users, Briefcase, Coffee, UserCircle } from 'lucide-react';
import Image from 'next/image';

interface ActionDescription {
    title: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    stats: Partial<GameStats>;
    message: string;
    exp: number;
}

const ACTION_DESCRIPTIONS: Record<string, ActionDescription> = {
    research: {
        title: '企業研究',
        icon: <Search size={40} />,
        color: 'bg-indigo-600',
        bg: '/game/bg/library.png',
        stats: { skill: 5, knowledge: 3, stamina: -20, stress: 10 },
        message: '愛媛の企業の強みや文化について理解を深めました！',
        exp: 20
    },
    interview: {
        title: '模擬面接',
        icon: <Users size={40} />,
        color: 'bg-orange-600',
        bg: '/game/bg/office.png',
        stats: { adaptability: 5, charm: 3, stamina: -25, stress: 15 },
        message: 'みかん先輩との練習で、受け答えに自信がつきました！',
        exp: 25
    },
    intern: {
        title: '短期インターン',
        icon: <Briefcase size={40} />,
        color: 'bg-purple-600',
        bg: '/game/bg/office_modern.png',
        stats: { skill: 10, adaptability: 5, stamina: -50, stress: 30 },
        message: '実際に現場を体験し、プロのスキルを肌で感じました。',
        exp: 50
    },
    analyze: {
        title: '自己分析',
        icon: <UserCircle size={40} />,
        color: 'bg-orange-400',
        bg: '/game/bg/room.png',
        stats: { adaptability: 3, skill: 2, stress: -5, stamina: -15 },
        message: '自分の「本当の強み」が少しずつ見えてきました。',
        exp: 15
    },
    rest: {
        title: '休息',
        icon: <Coffee size={40} />,
        color: 'bg-white text-slate-900',
        bg: '/game/bg/cafe.png',
        stats: { stamina: 40, stress: -20 },
        message: 'ゆっくり休んで、心身ともにリフレッシュしました！',
        exp: 10
    }
};

export default function ActionMenuPart() {
    const { currentActionType, modifyStats, addExperience, advanceWeek, setGameMode, setActionType } = useGameStore();
    const [anim, setAnim] = useState(true);
    const action = currentActionType ? ACTION_DESCRIPTIONS[currentActionType] : null;

    useEffect(() => {
        if (!action) {
            setGameMode('strategy');
            return;
        }

        const timer = setTimeout(() => {
            modifyStats(action.stats);
            addExperience(action.exp);
            advanceWeek();
            setAnim(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [action, currentActionType, modifyStats, addExperience, advanceWeek, setGameMode]);

    if (!action) return null;

    const handleFinish = () => {
        setActionType(null);
        setGameMode('strategy');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none">
            {/* Background */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={action.bg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    className="absolute inset-0 z-0"
                >
                    <Image src={action.bg} alt="bg" fill className="object-cover blur-[2px]" />
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-slate-950 z-0" />

            <AnimatePresence mode="wait">
                {anim ? (
                    <motion.div
                        key="anim"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 text-center space-y-8"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`${action.color} w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl relative`}
                        >
                            {action.icon}
                            <motion.div
                                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.5, 0.8] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute inset-0 rounded-[2.5rem] bg-white/20"
                            />
                        </motion.div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">{action.title}中...</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">Processing Strategy</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-10 bg-slate-900/80 backdrop-blur-3xl p-10 md:p-12 rounded-[4rem] border border-white/10 text-center max-w-lg w-full space-y-10 shadow-2xl"
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-2">
                            <Sparkles size={14} /> Result
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white">{action.title} 完了！</h2>
                            <p className="text-slate-300 font-bold">{action.message}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(action.stats).map(([key, val]) => {
                                if (!val || val === 0) return null;
                                const numVal = val as number;
                                const isPositive = numVal > 0;
                                const labels: Record<string, string> = {
                                    knowledge: '知識', skill: '技術', adaptability: '対応力',
                                    charm: '魅力', stamina: '体力', stress: 'ストレス', money: '所持金',
                                    patience: '忍耐', experience: '経験値', level: 'レベル'
                                };
                                const label = labels[key] || key;

                                return (
                                    <div key={key} className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
                                        <div className={`text-xl font-black ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {isPositive ? `+${numVal}` : numVal}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">経験値</div>
                                <div className="text-xl font-black text-blue-400">+{action.exp} EXP</div>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-white text-slate-950 font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 transition-all hover:bg-blue-50 active:scale-95 shadow-xl text-xl"
                        >
                            戦略画面へ戻る <ArrowRight size={22} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
