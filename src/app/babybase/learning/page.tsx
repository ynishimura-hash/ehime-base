"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    BookOpen, PlayCircle, Star, Search,
    ArrowLeft, Heart, MessageSquare, Clock,
    ChevronRight, Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function BabyBaseLearning() {
    const { bbArticles, bbSpecialists } = useAppStore();
    const [tab, setTab] = useState<'blog' | 'elearning'>('blog');

    // Mock E-learning data
    const courses = [
        { id: 'c1', title: '【動画講座】今日からできる産後ヨガ', duration: '15min', level: '初級', price: '無料', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop' },
        { id: 'c2', title: '赤ちゃんの「五感」を育む遊び方', duration: '20min', level: '初級', price: '¥500', image: 'https://images.unsplash.com/photo-1510333300284-1648bc70154d?q=80&w=600&auto=format&fit=crop' },
        { id: 'c3', title: '離乳食ステップアップ講座（中期）', duration: '30min', level: '中級', price: '無料', image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=600&auto=format&fit=crop' },
    ];

    return (
        <div className="min-h-screen bg-[#FFFBF0] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-pink-50 px-6 pt-6 pb-2">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/babybase" className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">学びの広場</h1>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Learning & Insights</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 px-4">
                    {[
                        { id: 'blog', label: 'ブログ・記事', icon: BookOpen },
                        { id: 'elearning', label: 'e-ラーニング', icon: PlayCircle },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`flex items-center gap-2 pb-3 relative transition-all ${tab === t.id ? 'text-slate-800 font-black' : 'text-slate-400 font-bold hover:text-slate-600'}`}
                        >
                            <t.icon size={18} />
                            <span className="text-sm">{t.label}</span>
                            {tab === t.id && (
                                <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <main className="p-6 space-y-8">
                <AnimatePresence mode="wait">
                    {tab === 'blog' ? (
                        <motion.div
                            key="blog"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Featured Article */}
                            <Link href={`/babybase/learning/${bbArticles[0].id}`} className="block relative h-64 rounded-[3rem] overflow-hidden group shadow-xl">
                                <img src={bbArticles[0].image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                                    <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Featured</span>
                                    <h2 className="text-xl font-black leading-tight line-clamp-2">{bbArticles[0].title}</h2>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/70">
                                        <Clock size={12} /> {bbArticles[0].publishedAt}
                                    </div>
                                </div>
                            </Link>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {bbArticles.slice(1).map(article => (
                                    <Link key={article.id} href={`/babybase/learning/${article.id}`} className="bg-white rounded-[2.5rem] p-4 flex gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden flex-shrink-0">
                                            <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                        </div>
                                        <div className="flex-1 py-1 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400">
                                                    {bbSpecialists.find(s => s.id === article.authorId)?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-slate-300 font-black">
                                                <span>{article.category}</span>
                                                <Bookmark size={14} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="elearning"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute right-[-10%] top-[-10%] opacity-20"><PlayCircle size={180} /></div>
                                <div className="space-y-4 relative z-10">
                                    <h2 className="text-2xl font-black italic tracking-tight">VIDEO COURSES</h2>
                                    <p className="text-sm text-slate-400 font-bold max-w-xs">
                                        好きな時間に、動画で学ぼう。<br />専門家が解説する実践的な育児テクニック。
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-pink-400">12</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">Available</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-indigo-400">03</p>
                                            <p className="text-[9px] font-black text-slate-500 uppercase">Completed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {courses.map(course => (
                                    <Link key={course.id} href={`/babybase/learning/course/${course.id}`} className="bg-white rounded-[2.5rem] p-6 flex items-center gap-6 border border-slate-100 shadow-sm hover:border-pink-200 transition-all group">
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <img src={course.image} className="w-full h-full object-cover rounded-[1.5rem]" alt="" />
                                            <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle size={32} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-pink-50 text-pink-500 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-widest">{course.level}</span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                                            </div>
                                            <h3 className="text-sm font-black text-slate-800 leading-tight">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs font-black text-pink-500">{course.price}</p>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-200 group-hover:text-pink-500" />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
