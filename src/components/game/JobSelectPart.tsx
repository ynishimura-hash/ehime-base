'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Coffee, Beer, ArrowLeft, Briefcase } from 'lucide-react';

export default function JobSelectPart() {
    const { setGameMode, setActionType } = useGameStore();

    const handleSelect = (job: 'cafe' | 'izakaya' | 'report') => {
        if (job === 'cafe') {
            setActionType('work'); // Reuses existing Quiz logic which checks for 'work' action type
            setGameMode('quiz');
        } else if (job === 'izakaya') {
            setGameMode('izakaya');
        } else if (job === 'report') {
            setGameMode('report');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 select-none">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/game/bg/city_night.png')] bg-cover bg-center opacity-40 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-950" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-2xl space-y-8"
            >
                <div className="text-center space-y-2">
                    <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 mb-4">
                        <Briefcase size={32} className="text-white" />
                    </div>
                    <h2 className="text-4xl font-black text-white italic">アルバイト選択</h2>
                    <p className="text-slate-400 font-bold">働く場所を選んでください</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cafe */}
                    <button
                        onClick={() => handleSelect('cafe')}
                        className="bg-orange-100 hover:bg-white group relative overflow-hidden rounded-[2.5rem] p-6 text-left transition-all hover:scale-105 shadow-xl border-4 border-white/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 text-orange-900 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <Coffee size={80} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <span className="bg-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full">難易度: 易</span>
                            <h3 className="text-2xl font-black text-orange-900">カフェ店員</h3>
                            <p className="text-orange-800/70 font-bold text-xs">
                                敬語クイズで接客マナーを学ぼう。<br />
                                知識と報酬が手に入ります。
                            </p>
                        </div>
                    </button>

                    {/* Izakaya */}
                    <button
                        onClick={() => handleSelect('izakaya')}
                        className="bg-red-100 hover:bg-white group relative overflow-hidden rounded-[2.5rem] p-6 text-left transition-all hover:scale-105 shadow-xl border-4 border-white/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 text-red-900 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <Beer size={80} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full">難易度: 並</span>
                            <h3 className="text-2xl font-black text-red-900">居酒屋ホール</h3>
                            <p className="text-red-800/70 font-bold text-xs">
                                注文を記憶するメモリーゲーム。<br />
                                対応力と高収入を狙えます。
                            </p>
                        </div>
                    </button>

                    {/* Writer (Report) */}
                    <button
                        onClick={() => handleSelect('report')}
                        className="md:col-span-2 bg-blue-100 hover:bg-white group relative overflow-hidden rounded-[2.5rem] p-6 text-left transition-all hover:scale-105 shadow-xl border-4 border-white/50"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20 text-blue-900 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <Briefcase size={80} />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">難易度: 高</span>
                            <h3 className="text-2xl font-black text-blue-900">記事ライター</h3>
                            <p className="text-blue-800/70 font-bold text-xs">
                                タイミングよくキーを叩いて執筆！<br />
                                高いスキルと報酬獲得のチャンス。
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
