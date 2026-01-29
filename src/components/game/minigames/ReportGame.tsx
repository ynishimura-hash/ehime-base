'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { PenTool, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportGame() {
    const { modifyStats, advanceWeek, addExperience, setGameMode } = useGameStore();
    const [gameState, setGameState] = useState<'intro' | 'play' | 'result'>('intro');
    const [score, setScore] = useState(0);
    const [round, setRound] = useState(1);
    const [cursorPos, setCursorPos] = useState(50); // 0-100
    const [targetPos, setTargetPos] = useState(50); // 0-100 center of target
    const [targetWidth, setTargetWidth] = useState(20); // Width of target

    // Physics refs for smooth anim
    const posRef = useRef(50);
    const dirRef = useRef(1); // 1 or -1
    const speedRef = useRef(1.5);
    const reqRef = useRef<number | null>(null);

    const startGame = () => {
        setScore(0);
        setRound(1);
        startRound(1);
        setGameState('play');
    };

    const startRound = (r: number) => {
        posRef.current = 0;
        dirRef.current = 1;
        speedRef.current = 1.5 + (r * 0.2); // Speed up each round
        setTargetWidth(Math.max(5, 25 - (r * 2))); // Shrink target
        setTargetPos(Math.random() * 60 + 20); // Random position 20-80

        if (reqRef.current) cancelAnimationFrame(reqRef.current);
        gameLoop();
    };

    const gameLoop = () => {
        posRef.current += speedRef.current * dirRef.current;
        if (posRef.current >= 100 || posRef.current <= 0) {
            dirRef.current *= -1;
        }
        setCursorPos(posRef.current);
        reqRef.current = requestAnimationFrame(gameLoop);
    };

    const handleStop = () => {
        if (reqRef.current) cancelAnimationFrame(reqRef.current);

        // Check hit
        const min = targetPos - (targetWidth / 2);
        const max = targetPos + (targetWidth / 2);
        const hit = posRef.current >= min && posRef.current <= max;
        // Perfect hit (center 20% of target)
        const perfectMin = targetPos - (targetWidth / 5);
        const perfectMax = targetPos + (targetWidth / 5);
        const perfect = posRef.current >= perfectMin && posRef.current <= perfectMax;

        if (perfect) {
            setScore(prev => prev + 150);
            toast.success('Perfect!!', { icon: '✨' });
        } else if (hit) {
            setScore(prev => prev + 100);
            toast.success('Good!', { icon: '👍' });
        } else {
            toast.error('Miss...', { icon: '💦' });
        }

        setTimeout(() => {
            if (round < 5) {
                setRound(prev => prev + 1);
                startRound(round + 1);
            } else {
                setGameState('result');
            }
        }, 800);
    };

    const handleFinish = () => {
        const money = score * 20 + 2000;
        const skill = Math.floor(score / 50);

        modifyStats({
            money: money,
            skill: skill,
            stamina: -25,
            stress: 10
        });
        addExperience(score / 2);
        advanceWeek();
        setGameMode('strategy');
    };

    useEffect(() => {
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/game/bg/library.png')] bg-cover bg-center opacity-40 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-slate-950" />

            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="relative z-10 bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8 shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
                            <PenTool size={48} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white italic">ライターバイト</h2>
                            <p className="text-slate-400 font-bold leading-relaxed">
                                タイミングよくキーを押して、<br />
                                質の高い記事を書き上げよう！
                            </p>
                        </div>
                        <button
                            onClick={startGame}
                            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-xl"
                        >
                            執筆開始
                        </button>
                    </motion.div>
                )}

                {gameState === 'play' && (
                    <div className="relative z-10 w-full max-w-3xl flex flex-col items-center space-y-12">
                        <div className="bg-white/10 px-8 py-3 rounded-full text-white font-black text-xl border border-white/10">
                            記事作成中... {round} / 5
                        </div>

                        {/* Timing Bar Container */}
                        <div className="w-full h-24 bg-slate-800 rounded-full border-4 border-slate-600 relative overflow-hidden shadow-inner">
                            {/* Target Zone */}
                            <div
                                className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-emerald-500/50 border-x-2 border-emerald-300"
                                style={{
                                    left: `${targetPos - targetWidth / 2}%`,
                                    width: `${targetWidth}%`
                                }}
                            />
                            {/* Perfect Center Line */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white/80 z-0"
                                style={{ left: `${targetPos}%` }}
                            />

                            {/* Cursor */}
                            <div
                                className="absolute top-0 bottom-0 w-3 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 rounded-full transform -translate-x-1/2"
                                style={{ left: `${cursorPos}%` }}
                            />
                        </div>

                        <button
                            onMouseDown={handleStop}
                            className="w-64 h-64 bg-blue-600 hover:bg-blue-500 rounded-full border-8 border-blue-400 shadow-[0_0_50px_rgba(37,99,235,0.5)] flex items-center justify-center active:scale-95 transition-all group"
                        >
                            <span className="text-4xl font-black text-white group-hover:scale-110 transition-transform">STOP</span>
                        </button>
                    </div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-slate-900 p-12 rounded-[3rem] border border-white/10 text-center max-w-md w-full space-y-8 shadow-2xl mx-auto"
                    >
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black text-white italic">執筆完了</h2>
                            <div className="text-6xl font-black text-blue-400 flex items-center justify-center gap-2">
                                <span className="text-2xl text-slate-400">Score</span> {score}
                            </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>報酬</span>
                                <span className="text-emerald-400 text-lg">+{score * 20 + 2000}円</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>スキル</span>
                                <span className="text-blue-400 text-lg">+{Math.floor(score / 50)}</span>
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
