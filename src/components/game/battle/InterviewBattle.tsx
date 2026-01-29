'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Swords, Shield, Heart, Zap, MessageCircle, AlertTriangle, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Card {
    id: string;
    name: string;
    type: 'appeal' | 'counter' | 'recover';
    cost: number; // Stamina cost
    power: number;
    stat: 'knowledge' | 'adaptability' | 'skill' | 'charm' | 'patience';
    description: string;
}

interface Enemy {
    name: string;
    hp: number; // Doubt
    maxHp: number;
    atk: number; // Pressure
    image: string;
    element: 'logic' | 'passion' | 'authority'; // Rock paper scissors?
}

// Sample Data
const CARDS: Card[] = [
    { id: 'c1', name: '論理的説明', type: 'appeal', cost: 10, power: 20, stat: 'knowledge', description: '知識と論理で納得させる。' },
    { id: 'c2', name: '笑顔で応答', type: 'appeal', cost: 5, power: 15, stat: 'charm', description: '愛想よく振る舞い、好感度を稼ぐ。' },
    { id: 'c3', name: '実績アピール', type: 'appeal', cost: 15, power: 25, stat: 'skill', description: '具体的なスキルと実績を提示する。' },
    { id: 'c4', name: '深呼吸', type: 'recover', cost: 0, power: 20, stat: 'patience', description: 'メンタルを回復する。' },
    { id: 'c5', name: '臨機応変', type: 'counter', cost: 10, power: 15, stat: 'adaptability', description: '相手の質問を巧みにかわす。' },
];

const INITIAL_ENEMY: Enemy = {
    name: '圧迫面接官',
    hp: 100,
    maxHp: 100,
    atk: 15,
    image: '/game/chara/enemy/interviewer_angry.png', // Placeholder
    element: 'authority'
};

export default function InterviewBattle() {
    const { stats, modifyStats, setGameMode, advanceWeek } = useGameStore();

    // Battle State
    const [phase, setPhase] = useState<'start' | 'player_turn' | 'enemy_turn' | 'win' | 'lose'>('start');
    const [enemy, setEnemy] = useState<Enemy>(INITIAL_ENEMY);
    const [playerHp, setPlayerHp] = useState(100);
    const [maxPlayerHp] = useState(100);
    const [hand, setHand] = useState<Card[]>([]);
    const [log, setLog] = useState<string[]>(['面接官が現れた！']);

    // Initial Hand Draw
    useEffect(() => {
        if (phase === 'start') {
            const initialHand = Array.from({ length: 4 }).map(() => CARDS[Math.floor(Math.random() * CARDS.length)]);
            setHand(initialHand);
            setTimeout(() => setPhase('player_turn'), 1500);
        }
    }, [phase]);

    // Add logging
    const addLog = (msg: string) => {
        setLog(prev => [msg, ...prev].slice(0, 3));
    };

    // Player Action
    const playCard = (card: Card) => {
        if (phase !== 'player_turn') return;

        addLog(`あなた: ${card.name}！ (${card.description})`);

        // Calculate Damage based on stat
        const statVal = (stats as any)[card.stat] || 10;
        const damage = Math.floor(card.power * (1 + statVal / 50)); // Base scaling

        // Apply Effect
        if (card.type === 'appeal' || card.type === 'counter') {
            setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
            addLog(`面接官に ${damage} の説得ダメージ！`);
            toast.success(`${damage} point!`);
        } else if (card.type === 'recover') {
            setPlayerHp(prev => Math.min(maxPlayerHp, prev + damage));
            addLog(`メンタルが ${damage} 回復した！`);
        }

        // Remove card
        setHand(prev => prev.filter(c => c !== card));

        // Check Win
        if (enemy.hp - damage <= 0 && card.type !== 'recover') {
            setTimeout(() => setPhase('win'), 1000);
        } else {
            setTimeout(() => setPhase('enemy_turn'), 1000);
        }
    };

    // Enemy Turn
    useEffect(() => {
        if (phase === 'enemy_turn') {
            setTimeout(() => {
                const dmg = Math.floor(enemy.atk * (0.8 + Math.random() * 0.4));
                setPlayerHp(prev => Math.max(0, prev - dmg));
                addLog(`面接官: 「なぜ弊社なのか？」 (${dmg}ダメージ)`);
                toast.error(`メンタルダメージ -${dmg}`);

                // Check Lose
                if (playerHp - dmg <= 0) {
                    setPhase('lose');
                } else {
                    // Draw a card
                    const newCard = CARDS[Math.floor(Math.random() * CARDS.length)];
                    setHand(prev => [...prev, newCard].slice(0, 5)); // Max 5 cards
                    setPhase('player_turn');
                }
            }, 1500);
        }
    }, [phase, enemy.atk, playerHp]);

    const handleFinish = (result: 'win' | 'lose') => {
        if (result === 'win') {
            modifyStats({
                money: 5000,
                stress: -20,
                play_select: undefined // Clear temp
            } as any);
            toast.success('面接合格！内定に一歩近づいた！');
        } else {
            modifyStats({
                stress: 30,
                stamina: -20
            });
            toast.error('面接不合格... お祈りメールが届きそうだ...');
        }
        advanceWeek();
        setGameMode('strategy');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/game/bg/office_modern.png')] bg-cover bg-center opacity-30 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-slate-950/90" />

            {/* Battle Container */}
            <div className="relative z-10 w-full max-w-4xl h-full flex flex-col p-4">

                {/* Header (Turn Info) */}
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white font-black text-sm">TURN {log.length}</div>
                        <div className="text-white font-bold text-shadow">{phase === 'player_turn' ? 'あなたのターン' : phase === 'enemy_turn' ? '面接官のターン' : 'Battle Start'}</div>
                    </div>
                    <div className="text-slate-400 text-xs font-mono">VS Interviewer</div>
                </div>

                {/* Main Battle Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative my-4">

                    {/* Enemy */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative mb-8"
                    >
                        {/* Enemy HP Bar */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64">
                            <div className="flex justify-between text-xs font-bold text-red-300 mb-1">
                                <span>{enemy.name} (疑念度)</span>
                                <span>{enemy.hp}/{enemy.maxHp}</span>
                            </div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                                <motion.div
                                    className="h-full bg-red-500"
                                    animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Enemy Avatar */}
                        <div className="w-48 h-48 bg-slate-800 rounded-full border-4 border-red-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                            {/* Placeholder Icon */}
                            <Users size={80} className="text-red-400" />
                        </div>
                    </motion.div>

                    {/* Log / Dialogue */}
                    <div className="w-full max-w-lg bg-black/60 p-4 rounded-xl border border-white/10 h-24 overflow-hidden mb-4 relative">
                        <AnimatePresence mode="popLayout">
                            {log.map((l, i) => (
                                <motion.div
                                    key={`${i}-${l}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1 - i * 0.3, x: 0 }}
                                    className="text-white/90 font-bold mb-1 text-sm border-l-2 border-blue-500 pl-2"
                                >
                                    {l}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Player Stats (HP/Mental) */}
                    <div className="w-full max-w-lg mb-4">
                        <div className="flex justify-between text-xs font-bold text-blue-300 mb-1">
                            <span>メンタル (HP)</span>
                            <span>{playerHp}/{maxPlayerHp}</span>
                        </div>
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600 relative">
                            <motion.div
                                className="h-full bg-blue-500"
                                animate={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Cards Hand */}
                    <div className="flex gap-3 justify-center items-end h-40 w-full overflow-x-auto pb-4 px-4">
                        <AnimatePresence>
                            {hand.map((card, i) => (
                                <motion.button
                                    key={card.id + i}
                                    initial={{ opacity: 0, y: 50, rotate: -10 }}
                                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                                    exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                    whileHover={{ y: -20, scale: 1.1, zIndex: 10 }}
                                    onClick={() => playCard(card)}
                                    disabled={phase !== 'player_turn'}
                                    className={`
                                        relative w-28 h-40 rounded-xl border-2 shadow-xl flex flex-col p-2 text-left transition-colors flex-shrink-0
                                        ${card.type === 'appeal' ? 'bg-indigo-900 border-indigo-400 hover:bg-indigo-800' :
                                            card.type === 'recover' ? 'bg-emerald-900 border-emerald-400 hover:bg-emerald-800' :
                                                'bg-orange-900 border-orange-400 hover:bg-orange-800'}
                                    `}
                                >
                                    <div className="text-[10px] font-black text-white/50 mb-1 uppercase tracking-widest">{card.type}</div>
                                    <div className="font-bold text-white text-sm leading-tight mb-2">{card.name}</div>
                                    <div className="flex-1 flex items-center justify-center opacity-20">
                                        {card.type === 'appeal' && <Swords size={40} />}
                                        {card.type === 'recover' && <Heart size={40} />}
                                        {card.type === 'counter' && <Shield size={40} />}
                                    </div>
                                    <div className="text-[9px] text-white/80 leading-tight border-t border-white/20 pt-1 mt-1">
                                        {card.description}
                                    </div>
                                    <div className="absolute top-1 right-1 bg-black/50 rounded text-[9px] px-1 text-white font-mono">
                                        {card.power}
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            {/* Overlays (Start/Win/Lose) */}
            <AnimatePresence>
                {(phase === 'start' || phase === 'win' || phase === 'lose') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center"
                    >
                        {phase === 'start' && (
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="space-y-6"
                            >
                                <h1 className="text-6xl font-black text-white italic tracking-tighter">BATTLE START</h1>
                                <p className="text-2xl text-red-500 font-bold">VS 圧迫面接官</p>
                            </motion.div>
                        )}
                        {phase === 'win' && (
                            <motion.div className="space-y-8 bg-slate-900 p-12 rounded-[3rem] border border-yellow-500/30 shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                                <Trophy size={80} className="text-yellow-400 mx-auto" />
                                <h2 className="text-5xl font-black text-white">面接合格！</h2>
                                <p className="text-slate-400 font-bold">あなたの熱意が伝わりました。</p>
                                <button onClick={() => handleFinish('win')} className="bg-yellow-500 text-black font-black px-12 py-4 rounded-full text-xl hover:bg-yellow-400 transition-colors">
                                    次のステップへ
                                </button>
                            </motion.div>
                        )}
                        {phase === 'lose' && (
                            <motion.div className="space-y-8 bg-slate-900 p-12 rounded-[3rem] border border-red-500/30 shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                                <AlertTriangle size={80} className="text-red-500 mx-auto" />
                                <h2 className="text-5xl font-black text-white">不合格...</h2>
                                <p className="text-slate-400 font-bold">今回はご縁がなかったようです。</p>
                                <button onClick={() => handleFinish('lose')} className="bg-slate-700 text-white font-black px-12 py-4 rounded-full text-xl hover:bg-slate-600 transition-colors">
                                    戻る
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
