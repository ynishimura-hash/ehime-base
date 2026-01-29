'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Beer, Utensils, Zap, Clock, Trophy, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

// Menu Items
const MENU_ITEMS = [
    { id: 'beer', name: '生ビール', icon: '🍺', color: 'bg-yellow-500' },
    { id: 'yakitori', name: '焼き鳥', icon: '🍢', color: 'bg-orange-600' },
    { id: 'edamame', name: '枝豆', icon: '🫛', color: 'bg-green-500' },
    { id: 'karaage', name: '唐揚げ', icon: '🍗', color: 'bg-orange-400' },
    { id: 'sake', name: '日本酒', icon: '🍶', color: 'bg-blue-400' },
    { id: 'rice', name: 'お茶漬け', icon: '🍚', color: 'bg-white text-slate-900' },
];

export default function IzakayaGame() {
    const { modifyStats, advanceWeek, addExperience, setGameMode } = useGameStore();
    const [gameState, setGameState] = useState<'intro' | 'memorize' | 'recall' | 'result'>('intro');
    const [sequence, setSequence] = useState<typeof MENU_ITEMS>([]);
    const [playerSequence, setPlayerSequence] = useState<typeof MENU_ITEMS>([]);
    const [level, setLevel] = useState(1); // 1: 3 items, 2: 4 items, 3: 5 items
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5); // Memorize time

    // Start Game
    const startGame = () => {
        setLevel(1);
        setScore(0);
        startRound(1);
    };

    // Start Round
    const startRound = (lvl: number) => {
        const count = lvl + 2; // Level 1 = 3 items
        const newSeq = Array.from({ length: count }).map(() => MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)]);
        setSequence(newSeq);
        setPlayerSequence([]);
        setGameState('memorize');
        setTimeLeft(3 + lvl); // More time for higher levels
    };

    // Timer for Memorize Phase
    useEffect(() => {
        if (gameState === 'memorize') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setGameState('recall');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameState]);

    // Handle Player Input
    const handleSelect = (item: typeof MENU_ITEMS[0]) => {
        if (gameState !== 'recall') return;

        const newPlayerSeq = [...playerSequence, item];
        setPlayerSequence(newPlayerSeq);

        // Check correct so far
        const currentIndex = newPlayerSeq.length - 1;
        if (item.id !== sequence[currentIndex].id) {
            // Mistake!
            toast.error('注文が違います！');
            setTimeout(() => setGameState('result'), 500);
            return;
        }

        // Check if complete
        if (newPlayerSeq.length === sequence.length) {
            toast.success('完璧です！');
            const nextLevel = level + 1;
            if (nextLevel > 3) {
                // All cleared
                setScore(prev => prev + 100);
                setTimeout(() => setGameState('result'), 1000);
            } else {
                setScore(prev => prev + 50); // Level clear bonus
                setLevel(nextLevel);
                setTimeout(() => startRound(nextLevel), 1000);
            }
        }
    };

    // Quit / Finish
    const handleFinish = () => {
        const moneyEarned = score * 30 + 1000;
        const expEarned = score * 0.5 + 20;

        modifyStats({ money: moneyEarned, stamina: -25, stress: 5, adaptability: 5 });
        addExperience(Math.floor(expEarned));
        advanceWeek();
        setGameMode('strategy');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/game/bg/izakaya.png')] bg-cover bg-center opacity-30 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950" />

            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8 shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30">
                            <Beer size={48} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white italic">居酒屋バイト</h2>
                            <p className="text-slate-400 font-bold leading-relaxed">
                                注文を暗記して、正確に提供しましょう。<br />
                                レベルが上がると注文数が増えます！
                            </p>
                        </div>
                        <button
                            onClick={startGame}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-xl"
                        >
                            アルバイト開始
                        </button>
                    </motion.div>
                )}

                {gameState === 'memorize' && (
                    <motion.div
                        key="memorize"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 w-full max-w-3xl flex flex-col items-center space-y-12"
                    >
                        <div className="bg-red-600 px-8 py-3 rounded-full text-white font-black text-xl flex items-center gap-3 animate-pulse">
                            <Clock size={24} />
                            注文を覚えてください！残り {timeLeft}秒
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            {sequence.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2 }}
                                    className={`${item.color} w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-4 border-white/20`}
                                >
                                    {item.icon}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {gameState === 'recall' && (
                    <motion.div
                        key="recall"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 w-full max-w-3xl flex flex-col items-center space-y-8"
                    >
                        <h3 className="text-3xl font-black text-white">注文は何でしたか？</h3>

                        {/* Current Player Sequence */}
                        <div className="h-28 flex items-center gap-2 bg-white/10 px-6 rounded-3xl min-w-[300px] justify-center border border-white/10">
                            {playerSequence.map((item, i) => (
                                <div key={i} className="text-4xl animate-bounce">
                                    {item.icon}
                                </div>
                            ))}
                            {playerSequence.length < sequence.length && (
                                <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/20">?</div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-3 gap-4">
                            {MENU_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className={`${item.color} w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105`}
                                >
                                    <span className="text-3xl mb-1">{item.icon}</span>
                                    <span className="text-[10px] font-bold text-white/90 bg-black/20 px-2 rounded-full">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-slate-900 p-12 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8 shadow-2xl"
                    >
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white italic">お疲れ様！</h2>
                            <div className="text-6xl font-black text-yellow-400 flex items-center justify-center gap-2">
                                <span className="text-2xl text-slate-400">Score</span> {score}
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>給料</span>
                                <span className="text-emerald-400 text-lg">+{score * 30 + 1000}円</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>適応力</span>
                                <span className="text-blue-400 text-lg">+5</span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-6 rounded-[2.5rem] transition-all shadow-xl active:scale-95 text-xl"
                        >
                            戻る
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
