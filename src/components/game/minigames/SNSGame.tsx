'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Smartphone, Bell, X, Check, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: number;
    x: number;
    y: number;
    type: 'like' | 'message' | 'alert';
}

export default function SNSGame() {
    const { modifyStats, advanceWeek, setGameMode } = useGameStore();
    const [gameState, setGameState] = useState<'intro' | 'play' | 'result'>('intro');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [notes, setNotes] = useState<Notification[]>([]);
    const nextId = useRef(0);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

    const startGame = () => {
        setScore(0);
        setTimeLeft(20);
        setNotes([]);
        setGameState('play');
    };

    // Game Loop
    useEffect(() => {
        if (gameState === 'play') {
            // Timer
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setGameState('result');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Spawner
            const spawner = setInterval(() => {
                setNotes(prev => {
                    if (prev.length >= 8) return prev; // Max 8 on screen

                    const id = nextId.current++;
                    const x = Math.random() * 80 + 10; // 10-90%
                    const y = Math.random() * 60 + 20; // 20-80%
                    const type = Math.random() > 0.8 ? 'alert' : Math.random() > 0.5 ? 'message' : 'like';

                    return [...prev, { id, x, y, type }];
                });
            }, 600); // Spawn every 600ms

            return () => {
                clearInterval(timer);
                clearInterval(spawner);
            };
        }
    }, [gameState]);

    const handleTap = (id: number) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        setScore(prev => prev + 1);

        // Sound effect or vibration could go here
    };

    const handleFinish = () => {
        const stressReduction = Math.min(50, Math.floor(score * 1.5));
        const cost = 2000; // Playing costs money? Or just time?

        modifyStats({
            stress: -stressReduction,
            stamina: -10,
            charm: 2
        });

        advanceWeek();
        setGameMode('strategy');
        toast.info(`ストレスが ${stressReduction} 下がりました！`);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/game/bg/room_night.png')] bg-cover bg-center opacity-40 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-slate-950" />

            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8 shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/30">
                            <Smartphone size={48} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white italic">SNS通知バスター</h2>
                            <p className="text-slate-400 font-bold leading-relaxed">
                                次々と来る通知をタップして既読にしよう！<br />
                                通知を溜めるとストレスが溜まるぞ。
                            </p>
                        </div>
                        <button
                            onClick={startGame}
                            className="w-full bg-pink-500 hover:bg-pink-400 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-xl"
                        >
                            スマホを見る
                        </button>
                    </motion.div>
                )}

                {gameState === 'play' && (
                    <div className="relative z-10 w-full h-full max-w-md mx-auto flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-white/10 mt-4 mx-4">
                            <div className="text-white font-black text-xl flex items-center gap-2">
                                <span className="bg-pink-500 p-2 rounded-xl"><Check size={16} /></span>
                                {score} 既読
                            </div>
                            <div className="text-white font-black text-xl flex items-center gap-2">
                                <span className={`p-2 rounded-xl ${timeLeft < 5 ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}>
                                    <Bell size={16} />
                                </span>
                                {timeLeft}s
                            </div>
                        </div>

                        {/* Game Area */}
                        <div className="flex-1 relative mt-4">
                            <AnimatePresence>
                                {notes.map((note) => (
                                    <motion.button
                                        key={note.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 1.5, opacity: 0 }}
                                        className={`absolute w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border-4 border-white active:scale-90 transition-transform cursor-pointer
                                            ${note.type === 'alert' ? 'bg-red-500' : note.type === 'message' ? 'bg-green-500' : 'bg-blue-500'}
                                        `}
                                        style={{ left: `${note.x}%`, top: `${note.y}%` }}
                                        onClick={() => handleTap(note.id)}
                                        whileTap={{ scale: 0.8 }}
                                    >
                                        {note.type === 'alert' && <Bell className="text-white" size={24} />}
                                        {note.type === 'message' && <Smartphone className="text-white" size={24} />}
                                        {note.type === 'like' && <Heart className="text-white" size={24} fill="white" />}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-slate-900 p-12 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8 shadow-2xl mx-auto mt-20"
                    >
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white italic">スッキリ！</h2>
                            <div className="text-6xl font-black text-pink-400 flex items-center justify-center gap-2">
                                <span className="text-2xl text-slate-400">Score</span> {score}
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>ストレス解消</span>
                                <span className="text-emerald-400 text-lg">-{Math.min(50, Math.floor(score * 1.5))}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>魅力</span>
                                <span className="text-pink-400 text-lg">+2</span>
                            </div>
                        </div>

                        <button
                            onClick={handleFinish}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] transition-all shadow-xl active:scale-95 text-xl"
                        >
                            戻る
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
