'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Zap, Heart, AlertCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function ActionGame() {
    const { modifyStats, addExperience, advanceWeek, setGameMode } = useGameStore();
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover' | 'clear'>('intro');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isInvincible, setIsInvincible] = useState(false);
    const [obstacles, setObstacles] = useState<{ id: number; x: number; type: string }[]>([]);

    // Physics State (Refs for performance)
    const playerY = useRef(0);
    const velocity = useRef(0);
    const isGrounded = useRef(true);
    const playerRef = useRef<HTMLDivElement>(null);

    // Constants
    const GRAVITY = 0.6;
    const JUMP_FORCE = 15;
    const GROUND_Y = 0;

    // Refs for game loop state to avoid closure staleness
    const gameLoopRef = useRef<number>(undefined);
    const lastId = useRef(0);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const isInvincibleRef = useRef(false);
    const gameStateRef = useRef<'intro' | 'playing' | 'gameover' | 'clear'>('intro');

    // Sync refs with state
    useEffect(() => {
        scoreRef.current = score;
        livesRef.current = lives;
        isInvincibleRef.current = isInvincible;
        gameStateRef.current = gameState;
    }, [score, lives, isInvincible, gameState]);

    const jump = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (gameStateRef.current === 'playing' && isGrounded.current) {
            velocity.current = JUMP_FORCE;
            isGrounded.current = false;
        }
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setObstacles([]);
        lastId.current = 0;

        // Reset Physics
        playerY.current = 0;
        velocity.current = 0;
        isGrounded.current = true;

        // Reset refs
        scoreRef.current = 0;
        livesRef.current = 3;
        isInvincibleRef.current = false;
        gameStateRef.current = 'playing';

        gameLoop();
    };

    const handleDamage = () => {
        if (isInvincibleRef.current) return;

        setIsInvincible(true);
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                setGameState('gameover');
            }
            return newLives;
        });

        // Invincibility duration
        setTimeout(() => {
            setIsInvincible(false);
        }, 1500);
    };

    const gameLoop = () => {
        if (gameStateRef.current !== 'playing') return;

        // --- Physics Update ---
        if (!isGrounded.current || velocity.current > 0) {
            velocity.current -= GRAVITY;
            playerY.current += velocity.current;

            if (playerY.current <= GROUND_Y) {
                playerY.current = GROUND_Y;
                velocity.current = 0;
                isGrounded.current = true;
            } else {
                isGrounded.current = false;
            }
        }

        // Apply to visual
        if (playerRef.current) {
            playerRef.current.style.transform = `translateY(${-playerY.current}px)`;
        }

        // --- Goal Condition ---
        if (scoreRef.current >= 300) {
            setGameState('clear');
            return;
        }

        // --- Obstacles & Collision ---
        setObstacles(prev => {
            // Move obstacles
            const next = prev
                .map(o => ({ ...o, x: o.x - 7 })) // Speed 7
                .filter(o => o.x > -100);

            // Add new obstacle
            const lastObstacle = next[next.length - 1];
            if (!lastObstacle || (lastObstacle.x < 700 && Math.random() < 0.025)) {
                lastId.current++;
                const type = Math.random() > 0.6 ? 'stress' : Math.random() > 0.5 ? 'exam' : 'report';
                next.push({ id: lastId.current, x: 1000, type });
            }

            // Precise Collision Check
            // Player: x=150, width=96 (let's say hitbox is smaller centered), y=playerY
            // Hitbox X: 170 ~ 220 (width 50)
            // Hitbox Y: playerY ~ playerY + 80
            const pBox = {
                x1: 170,
                x2: 220,
                y1: playerY.current,
                y2: playerY.current + 80
            };

            next.forEach(o => {
                // Obstacle: x=o.x, width=80
                // Obs Hitbox: x+15 ~ x+65, height 60
                const oBox = {
                    x1: o.x + 15,
                    x2: o.x + 65,
                    y1: 0,
                    y2: 60
                };

                // AABB Collision
                const overlapX = (pBox.x1 < oBox.x2 && pBox.x2 > oBox.x1);
                const overlapY = (pBox.y1 < oBox.y2 && pBox.y2 > oBox.y1);

                if (overlapX && overlapY) {
                    handleDamage();
                }
            });

            return next;
        });

        setScore(prev => prev + 0.5);
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, []);

    const handleFinish = (isClear: boolean) => {
        if (isClear) {
            modifyStats({ stress: -30, charm: 5, skill: 5 });
            addExperience(50);
            toast.success('単位回避成功！！');
        } else {
            modifyStats({ stress: 10, stamina: -20 });
            toast.error('単位を落としてしまった...');
        }
        advanceWeek();
        setGameMode('strategy');
    };

    const handleQuit = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setGameMode('strategy');
    };

    return (
        <div
            className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden select-none ${isInvincible ? 'animate-shake' : ''}`}
            onClick={jump}
        >
            <style jsx global>{`
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                    animation-iteration-count: 1;
                }
            `}</style>

            {/* Environment */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900/30 to-slate-950" />

            {/* Floor */}
            <div className="absolute bottom-0 w-full h-32 bg-slate-900 border-t-4 border-slate-700" />

            <AnimatePresence mode="wait">
                {gameState === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 bg-slate-900 p-12 rounded-[3rem] text-center border border-white/10 space-y-8 max-w-md w-full shadow-2xl"
                    >
                        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
                            <Zap size={48} className="text-white" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter">単位回避 RUN!</h2>
                            <p className="text-slate-400 font-bold leading-relaxed">
                                画面タップでジャンプ！<br />
                                迫りくるレポートや試験を避けろ！<br />
                                <span className="text-yellow-400">目標: 300m 完走</span>
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); startGame(); }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-xl"
                        >
                            RUN START!
                        </button>
                    </motion.div>
                )}

                {gameState === 'playing' && (
                    <div className="w-full h-full relative max-w-5xl mx-auto">
                        {/* HUD */}
                        <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
                            <button
                                onClick={handleQuit}
                                className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-full text-sm backdrop-blur-md border border-white/10 transition-all"
                            >
                                辞める
                            </button>
                            {/* Lives */}
                            <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <Heart
                                        key={i}
                                        size={32}
                                        className={`${i < lives ? 'fill-red-500 text-red-500' : 'fill-slate-800 text-slate-700'} drop-shadow-lg transition-all`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Score */}
                        <div className="absolute top-4 right-4 z-50">
                            <div className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                {Math.floor(score)}<span className="text-2xl not-italic ml-1 text-slate-300">m</span>
                            </div>
                            <div className="text-right text-xs font-bold text-slate-400 tracking-widest mt-1">
                                GOAL: 300m
                            </div>
                        </div>

                        {/* Player */}
                        <div
                            ref={playerRef}
                            className={`absolute bottom-32 left-[150px] w-24 h-24 flex items-center justify-center z-10 ${isInvincible ? 'opacity-50' : ''}`}
                        // Note: transform is handled directly via ref in game loop for performance
                        >
                            <div className="text-7xl transform -scale-x-100 filter drop-shadow-2xl">🏃</div>
                        </div>

                        {/* Obstacles */}
                        {obstacles.map(o => (
                            <div
                                key={o.id}
                                style={{ left: `${o.x}px` }}
                                className="absolute bottom-32 w-20 h-20 flex items-center justify-center z-10"
                            >
                                <div className="text-6xl filter drop-shadow-lg transform hover:scale-110 transition-transform">
                                    {o.type === 'stress' ? '😰' : o.type === 'exam' ? '📝' : '📄'}
                                </div>
                                <div className="absolute -bottom-8 text-xs font-black text-slate-500 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm whitespace-nowrap">
                                    {o.type === 'stress' ? 'プレッシャー' : o.type === 'exam' ? '試験' : 'レポート'}
                                </div>
                            </div>
                        ))}

                        {/* Instructions */}
                        <div className="absolute bottom-10 inset-x-0 text-center text-white/20 font-black uppercase tracking-[0.5em] animate-pulse pointer-events-none">
                            Tap to Jump
                        </div>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameState === 'gameover' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-20 bg-slate-900 p-10 rounded-[3rem] text-center border border-red-500/30 space-y-6 max-w-md w-full shadow-2xl"
                    >
                        <AlertCircle size={64} className="text-red-500 mx-auto" />
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-white">留年確定…</h2>
                            <p className="text-slate-400 font-bold">単位を取り逃がしました。</p>
                        </div>
                        <div className="text-6xl font-black text-slate-700 my-4">{Math.floor(score)}m</div>

                        <div className="space-y-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); startGame(); }}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-all"
                            >
                                もう一度挑戦
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleFinish(false); }}
                                className="w-full text-slate-500 hover:text-white font-bold py-2 transition-all"
                            >
                                諦めて戻る
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Game Clear Screen */}
                {gameState === 'clear' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-20 bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[3rem] text-center border border-yellow-500/30 space-y-6 max-w-md w-full shadow-2xl"
                    >
                        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/50 animate-bounce">
                            <Trophy size={40} className="text-white" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">単位取得！</h2>
                            <p className="text-indigo-200 font-bold text-lg">無事、進級できました！</p>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-6 border border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300 border-b border-white/10 pb-2">
                                <span>走行距離</span>
                                <span className="text-white text-lg">{Math.floor(score)}m</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300 border-b border-white/10 pb-2">
                                <span>獲得経験値</span>
                                <span className="text-yellow-400 text-lg">+50 EXP</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                                <span>ストレス解消</span>
                                <span className="text-emerald-400 text-lg">-30%</span>
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleFinish(true); }}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-xl"
                        >
                            成績表を確認
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
