"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    BookOpen, Search, Filter, Clock, ChevronRight,
    ChevronLeft, ArrowRight, GraduationCap,
    Lightbulb, Layout as LayoutIcon
} from 'lucide-react';
import Link from 'next/link';

export default function CoursesListPage() {
    const { completedLessonIds, courses, fetchCourses } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('すべて');

    React.useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
    }, [courses.length, fetchCourses]);

    const categories = ['すべて', ...Array.from(new Set(courses.map(c => c.category)))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'すべて' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getProgress = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return 0;
        const allLessons = course.curriculums.flatMap(curr => curr.lessons);
        const completed = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
        return Math.round((completed / allLessons.length) * 100);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
                    <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 flex items-center gap-2">
                        <GraduationCap size={16} /> Reskill University
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                        愛媛で、一生モノの<br /><span className="text-blue-600">スキルを磨こう。</span>
                    </h1>
                    <p className="max-w-2xl text-slate-500 font-bold text-lg md:text-xl leading-relaxed">
                        地域DX、ITエンジニアリング、ビジネスマナーまで。<br className="hidden md:block" />
                        地元の企業の「今」必要としているスキルを体系的に学びます。
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="コース名やキーワードで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-4 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => {
                        const progress = getProgress(course.id);
                        return (
                            <Link
                                key={course.id}
                                href={`/reskill/course/${course.id}`}
                                className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={course.image}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={course.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                                            {course.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-white text-[10px] font-black">
                                            <Clock size={14} /> {course.duration}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.level}</span>
                                            {progress > 0 && (
                                                <span className="text-emerald-500 text-[10px] font-black flex items-center gap-1">
                                                    学習中: {progress}%
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-2">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src={course.instructor.image} className="w-8 h-8 rounded-full border-2 border-white shadow-md shadow-slate-200" alt="" />
                                            <span className="text-xs font-black text-slate-700">{course.instructor.name}</span>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">コースが見つかりませんでした</h3>
                        <p className="text-slate-500 font-bold">検索ワードを変えて試してみてください。</p>
                    </div>
                )}

                {/* Info Card */}
                <section className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden text-white shadow-2xl">
                    <div className="absolute right-[-5%] top-[-5%] text-white/5 rotate-12">
                        <Lightbulb size={300} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight tracking-tight">
                            学びを、<br /><span className="text-blue-400 italic">スカウト</span>に繋げよう。
                        </h2>
                        <p className="text-slate-400 font-bold text-lg mb-8 leading-relaxed">
                            Reskill Universityでの学習履歴は、企業に共有されます。特定のコースを完了した求職者には、企業から特別なオファーが届くかもしれません。
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Benefit 1</p>
                                <p className="font-black">スキルの可視化</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Benefit 2</p>
                                <p className="font-black">スカウト率の向上</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Navigation Buttons for switching back */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-2xl border border-slate-200 shadow-2xl z-50 flex gap-1">
                <Link href="/reskill" className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-400 hover:text-slate-600 font-black text-sm transition-colors">
                    <LayoutIcon size={18} /> Dashboard
                </Link>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-100">
                    <BookOpen size={18} /> Courses
                </button>
            </div>
        </div>
    );
}

