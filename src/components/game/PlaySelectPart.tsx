'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Gamepad2, Smartphone, ArrowLeft } from 'lucide-react';

export default function PlaySelectPart() {
    const { setGameMode, setActionType } = useGameStore();

    const handleSelect = (play: 'run' | 'sns') => {
        if (play === 'run') {
            setGameMode('action');
        } else if (play === 'sns') {
            setGameMode('sns');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/game/bg/park.png')] bg-cover bg-center opacity-40 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-2xl space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="bg-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-pink-500/30 mb-4">
                        <Gamepad2 size={32} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white italic">遊び選択</h2>
                    <p className="text-slate-400 font-bold">どうやってストレス発散する？</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Run Game */}
                    <button
                        onClick={() => handleSelect('run')}
                        className="bg-blue-100 hover:bg-white group relative overflow-hidden rounded-[2.5rem] p-8 text-left transition-all hover:scale-105 shadow-xl border-4 border-white/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 text-blue-900 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <Gamepad2 size={80} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">難易度: 激ムズ</span>
                            <h3 className="text-3xl font-black text-blue-900">単位回避ラン</h3>
                            <p className="text-blue-800/70 font-bold text-sm">
                                迫りくる障害物を避けてゴールを目指せ！<br />
                                ストレス発散効果: 大
                            </p>
                        </div>
                    </button>

                    {/* SNS Game */}
                    <button
                        onClick={() => handleSelect('sns')}
                        className="bg-pink-100 hover:bg-white group relative overflow-hidden rounded-[2.5rem] p-8 text-left transition-all hover:scale-105 shadow-xl border-4 border-white/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 text-pink-900 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <Smartphone size={80} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <span className="bg-pink-600 text-white text-[10px] font-black px-3 py-1 rounded-full">難易度: 連打</span>
                            <h3 className="text-3xl font-black text-pink-900">SNS通知バスター</h3>
                            <p className="text-pink-800/70 font-bold text-sm">
                                溜まり続ける通知をタップで爆破せよ！<br />
                                ストレス発散効果: 中
                            </p>
                        </div>
                    </button>
                </div>

                <button
                    onClick={() => setGameMode('strategy')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                    <ArrowLeft size={20} /> 戻る
                </button>
            </motion.div>
        </div>
    );
}
