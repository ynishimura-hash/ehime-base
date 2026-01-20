'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Zap, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActionGame() {
    const { modifyStats, addExperience, advanceWeek, setGameMode } = useGameStore();
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'result'>('intro');
    const [score, setScore] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [obstacles, setObstacles] = useState<{ id: number; x: number; type: string }[]>([]);
    const gameLoopRef = useRef<number>(undefined);
    const lastId = useRef(0);

    const jump = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!isJumping && gameState === 'playing') {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 600);
        }
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setObstacles([]);
        gameLoop();
    };

    const gameLoop = () => {
        setObstacles(prev => {
            const next = prev
                .map(o => ({ ...o, x: o.x - 5 }))
                .filter(o => o.x > -100);

            // Add new obstacle
            if (next.length === 0 || (next[next.length - 1].x < 700 && Math.random() < 0.02)) {
                lastId.current++;
                next.push({ id: lastId.current, x: 1000, type: Math.random() > 0.5 ? 'stress' : 'exam' });
            }

            // Collision check
            const collision = next.find(o => o.x > 100 && o.x < 200 && !isJumping);
            if (collision) {
                setGameState('result');
                return next;
            }

            return next;
        });

        setScore(prev => prev + 1);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        if (gameState !== 'playing') {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameState]);

    const handleFinish = () => {
        modifyStats({ stress: -Math.floor(score / 100), stamina: -15 });
        addExperience(Math.floor(score / 40) + 5);
        advanceWeek();
        setGameMode('strategy');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden" onClick={jump}>
            {/* Environment */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900/20 to-slate-950" />

            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-slate-900 p-12 rounded-[4rem] text-center border border-white/10 space-y-8"
                    >
                        <div className="w-24 h-24 bg-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                            <Zap size={48} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">単位回避 RUN!</h2>
                            <p className="text-slate-400 font-bold">画面タップでジャンプ！<br />迫りくる単位の追撃から逃げ切れ！</p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-6 rounded-[2.5rem] transition-all shadow-xl"
                        >
                            RUN START!
                        </button>
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <div className="w-full max-w-4xl h-96 relative border-b-4 border-white/20">
                        {/* Score */}
                        <div className="absolute top-0 right-0 text-4xl font-black text-white italic">
                            {score}m
                        </div>

                        {/* Player */}
                        <motion.div
                            animate={{ y: isJumping ? -150 : 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="absolute bottom-0 left-[150px] w-20 h-24 flex items-center justify-center"
                        >
                            <div className="text-6xl">🏃</div>
                        </motion.div>

                        {/* Obstacles */}
                        {obstacles.map(o => (
                            <div
                                key={o.id}
                                style={{ transform: `translateX(${o.x}px)` }}
                                className="absolute bottom-2 w-16 h-16 flex items-center justify-center text-5xl"
                            >
                                {o.type === 'stress' ? '😰' : '📄'}
                            </div>
                        ))}
                    </div>
                )}

                {gameState === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-slate-900 p-12 rounded-[4rem] text-center border border-white/10 space-y-10"
                    >
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-white">RECORDS</h2>
                            <div className="text-7xl font-black text-purple-500">{score}m</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ストレス解消</div>
                                <div className="text-2xl font-black text-emerald-400">-{Math.floor(score / 100)}%</div>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">経験値</div>
                                <div className="text-2xl font-black text-blue-400">+{Math.floor(score / 50)} EXP</div>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleFinish(); }}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-6 rounded-[2.5rem] transition-all shadow-xl"
                        >
                            リザルトを確認
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {gameState === 'playing' && (
                <div className="mt-20 text-white/20 font-black animate-pulse uppercase tracking-[0.5em]">
                    Tap anywhere to JUMP!
                </div>
            )}
        </div>
    );
}
