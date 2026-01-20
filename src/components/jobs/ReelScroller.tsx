"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Info, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { JOBS, COMPANIES } from '@/lib/dummyData';

export default function ReelScroller() {
    const [index, setIndex] = useState(0);

    // 体験JOBと注目の求人を表示
    const displayJobs = JOBS.filter(j => j.isExperience || j.category === '中途' || j.category === '新卒');

    const nextReel = () => index < displayJobs.length - 1 && setIndex(index + 1);
    const prevReel = () => index > 0 && setIndex(index - 1);

    const job = displayJobs[index];
    const company = COMPANIES.find(c => c.id === job.companyId);

    return (
        <div className="relative w-full max-w-md h-[75vh] md:h-[80vh] mx-auto bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-zinc-900 mt-4 md:mt-10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={job.id}
                    initial={{ y: 300, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -300, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute inset-0 p-8 flex flex-col justify-end text-white overflow-hidden"
                >
                    {/* Background Gradient & Overlay */}
                    <div className={`absolute inset-0 opacity-60 ${company?.logoColor || 'bg-zinc-800'}`} />
                    <img
                        src={company?.image}
                        alt={company?.name}
                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black ring-1 ring-white/30 uppercase tracking-wider">
                                {job.category}
                            </span>
                            {job.isExperience && (
                                <span className="px-3 py-1 bg-orange-500 rounded-full text-[10px] font-black flex items-center gap-1">
                                    <Zap size={10} />
                                    体験クエスト
                                </span>
                            )}
                        </div>

                        <div>
                            <span className="text-xs font-bold text-zinc-300 tracking-wide uppercase">
                                {company?.name}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mt-1 drop-shadow-lg">
                                {job.title}
                            </h3>
                        </div>

                        <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <p className="text-white text-xs font-bold mb-1 opacity-70 underline decoration-orange-500">
                                あえて不完全な部分を明かします
                            </p>
                            <p className="text-zinc-100 text-[11px] leading-relaxed italic line-clamp-2">
                                「{company?.rjpNegatives}」
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button className="flex-1 bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg">
                                詳細を覗く
                            </button>
                            <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors">
                                <Heart className="text-white" />
                            </button>
                        </div>
                    </div>

                    {/* 右側アクションエリア */}
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-3 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 cursor-pointer"><Share2 size={24} /></div>
                            <span className="text-[10px] font-bold">シェア</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="p-3 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 cursor-pointer"><MessageCircle size={24} /></div>
                            <span className="text-[10px] font-bold">相談する</span>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* スワイプ制御用ボタン（本来はタッチジェスチャー） */}
            <div className="absolute left-1/2 -translate-x-1/2 top-4 z-20 flex flex-col gap-2">
                <button onClick={prevReel} className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60"><ChevronUp /></button>
                <button onClick={nextReel} className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60"><ChevronDown /></button>
            </div>

            {/* プログレスドット */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                {displayJobs.map((_, i) => (
                    <div key={i} className={`w-1 h-6 rounded-full transition-all ${i === index ? 'bg-white h-10' : 'bg-white/20'}`} />
                ))}
            </div>
        </div>
    );
}
