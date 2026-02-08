import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { generateFortuneMessage } from '@/lib/fortune/generator';

interface DailyFortuneProps {
    dayMaster?: string; // 甲, 乙, etc.
    userName?: string;
}

export const DailyFortune: React.FC<DailyFortuneProps> = ({ dayMaster, userName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [fortune, setFortune] = useState<{ score: number, color: string, item: string, message: string } | null>(null);

    useEffect(() => {
        if (!dayMaster) {
            setIsLoading(false);
            return;
        }

        // Simulate AI "Thinking"
        const timer = setTimeout(() => {
            const generated = generateFortuneMessage(dayMaster, userName);

            // Still generate the basic lucky items using the hash logic for consistency or generate them alongside
            const dateStr = new Date().toDateString();
            const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + dayMaster.charCodeAt(0);

            if (generated) {
                setFortune({
                    score: 70 + (hash % 30),
                    color: generated.luckyColor,
                    item: generated.luckyItem,
                    message: generated.message
                });
            }
            setIsLoading(false);
        }, 1500); // 1.5s delay for "AI sensation"

        return () => clearTimeout(timer);
    }, [dayMaster, userName]);

    if (!dayMaster) {
        return (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
                <div className="relative z-10">
                    <h3 className="text-sm font-black flex items-center gap-2 mb-2">
                        <Sparkles size={18} className="text-yellow-300 animate-pulse" />
                        今日の運勢
                    </h3>
                    <p className="text-xs font-bold text-indigo-100 mb-4 leading-relaxed">
                        四柱推命の診断を受けると、<br />AIがあなたの毎日の運勢を分析します。
                    </p>
                    <Link href="/analysis?tab=fortune" className="inline-block bg-white text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">
                        診断を受ける
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-lg min-h-[300px] flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-300" />
                        TODAY'S FORTUNE
                    </h3>
                    {fortune && (
                        <span className="text-2xl font-black text-yellow-300">{fortune.score}<span className="text-xs text-white/60 ml-1">点</span></span>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-80">
                        <Loader2 className="animate-spin text-indigo-300" size={32} />
                        <p className="text-xs font-bold text-indigo-200 animate-pulse">AIが運勢を分析中...</p>
                    </div>
                ) : fortune ? (
                    <div className="space-y-4 animate-in fade-in duration-700">
                        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                            <p className="text-[11px] leading-relaxed font-medium text-indigo-50 whitespace-pre-wrap">
                                {fortune.message}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-[9px] text-indigo-200 font-bold uppercase tracking-wider mb-1">ラッキーカラー</p>
                                <p className="text-sm font-black">{fortune.color}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <p className="text-[9px] text-indigo-200 font-bold uppercase tracking-wider mb-1">ラッキーアイテム</p>
                                <p className="text-sm font-black">{fortune.item}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-xs text-indigo-300">
                        運勢データを取得できませんでした。
                    </div>
                )}
            </div>
        </div>
    );
};
