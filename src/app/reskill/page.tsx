"use client";

import React from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    PlayCircle, CheckCircle2, BookOpen, Clock,
    TrendingUp, Award, ChevronRight, Layout,
    Zap, Star, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function ReskillDashboardPage() {
    const {
        completedLessonIds,
        lastViewedLessonIds,
        isLessonCompleted,
        courses,
        fetchCourses
    } = useAppStore();

    React.useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
    }, [courses.length, fetchCourses]);

    // Calculate overall progress
    const allLessons = courses.flatMap(c => c.curriculums.flatMap(curr => curr.lessons));
    const totalLessonsCount = allLessons.length;
    const completedCount = completedLessonIds.length;
    const overallProgress = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

    // Get recently viewed lessons info
    const recentlyViewedLessons = lastViewedLessonIds.map(id =>
        allLessons.find(l => l.id === id)
    ).filter(Boolean);

    // Get the most recent course being studied
    const lastLesson = recentlyViewedLessons[0];
    const activeCourse = lastLesson ? courses.find(c => c.curriculums.some(curr => curr.id === lastLesson.curriculumId)) : courses[0];
    const activeCourseLessons = activeCourse?.curriculums.flatMap(c => c.lessons) || [];
    const activeCourseCompletedCount = activeCourseLessons.filter(l => completedLessonIds.includes(l.id)).length;
    const activeCourseProgress = activeCourseLessons.length > 0 ? Math.round((activeCourseCompletedCount / activeCourseLessons.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                            <BookOpen size={24} />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter">Reskill University</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Stats Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-[-10%] top-[-10%] text-blue-50 opacity-50 group-hover:scale-110 transition-transform">
                            <Award size={140} />
                        </div>
                        <div className="relative z-10">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">全体の進捗</span>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-5xl font-black text-slate-900">{overallProgress}%</span>
                                <span className="text-slate-400 font-bold mb-1">達成</span>
                            </div>
                            <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${overallProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group text-white">
                        <div className="absolute right-[-10%] top-[-10%] text-white/5 group-hover:scale-110 transition-transform">
                            <Zap size={140} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-black text-white/50 uppercase tracking-widest">
                                    {activeCourseProgress > 0 ? '学習を継続する' : '新しく始める'}
                                </span>
                                <h3 className="text-2xl font-black mt-2 leading-tight line-clamp-2">
                                    {activeCourse?.title || "未経験から学ぶエンジニアの道"}
                                </h3>
                                {activeCourseProgress > 0 && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${activeCourseProgress}%` }} />
                                        </div>
                                        <span className="text-[10px] font-black text-blue-400">{activeCourseProgress}%</span>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={lastLesson ? `/reskill/lesson/${lastLesson.id}` : `/reskill/course/${activeCourse?.id}`}
                                className="mt-6 bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                {activeCourseProgress > 0 ? '学習を再開する' : 'コースを見る'} <PlayCircle size={20} />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">完了したステップ</span>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="text-5xl font-black text-slate-900">{completedCount}</div>
                                <div className="text-slate-400 font-bold leading-tight">
                                    lessons<br />completed
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 self-start px-3 py-1.5 rounded-full">
                            <TrendingUp size={14} />
                            先週比 +3
                        </div>
                    </div>
                </section>

                {/* Recently Viewed */}
                {recentlyViewedLessons.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <Clock className="text-blue-500" />
                                続きから見る
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentlyViewedLessons.map((lesson) => {
                                const course = courses.find(c => c.curriculums.some(curr => curr.id === (lesson as any).curriculumId));
                                return (
                                    <Link
                                        key={(lesson as any).id}
                                        href={`/reskill/lesson/${(lesson as any).id}`}
                                        className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                                    >
                                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                            <img
                                                src={course?.image}
                                                alt={course?.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg">
                                                    <PlayCircle size={32} />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded">
                                                {(lesson as any).duration}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{course?.title}</span>
                                            <h3 className="text-lg font-black text-slate-800 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                {(lesson as any).title}
                                            </h3>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Recommended Courses */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Star className="text-amber-500" fill="currentColor" />
                            おすすめのコース
                        </h2>
                        <Link href="/reskill/courses" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                            すべて見る <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/reskill/course/${course.id}`}
                                className="group flex flex-col md:flex-row bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full"
                            >
                                <div className="md:w-2/5 aspect-[4/3] md:aspect-auto relative">
                                    <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={course.title} />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-slate-800 shadow-sm border border-slate-100">
                                            {course.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${course.level === '初級' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                'bg-blue-50 text-blue-600 border border-blue-100'
                                                }`}>
                                                {course.level}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {course.duration}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-3">
                                            <img src={course.instructor.image} className="w-10 h-10 rounded-full border-2 border-white shadow-md text-[0px]" alt="" />
                                            <div>
                                                <p className="text-xs font-black text-slate-800 leading-none">{course.instructor.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{course.instructor.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const lessons = course.curriculums.flatMap(c => c.lessons);
                                                const completed = lessons.filter(l => completedLessonIds.includes(l.id)).length;
                                                const progress = Math.round((completed / lessons.length) * 100);
                                                if (progress > 0) {
                                                    return (
                                                        <div className="flex flex-col items-end mr-2">
                                                            <span className="text-[9px] font-black text-emerald-500 mb-1">{progress}% Complete</span>
                                                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* Bottom Nav Hint (for mobile style feel) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-2xl border border-slate-200 shadow-2xl z-50 flex gap-1">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-100">
                    <Layout size={18} /> Dashboard
                </button>
                <Link href="/reskill/courses" className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-400 hover:text-slate-600 font-black text-sm transition-colors">
                    <BookOpen size={18} /> Courses
                </Link>
            </div>
        </div>
    );
}
