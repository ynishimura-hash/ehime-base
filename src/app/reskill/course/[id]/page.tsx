"use client";

import React, { use } from 'react';
import { COURSES } from '@/lib/learningData';
import {
    ChevronLeft, PlayCircle, Clock, Award,
    BookOpen, CheckCircle2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const course = COURSES.find(c => c.id === id);
    const { isLessonCompleted } = useAppStore();

    if (!course) return <div>Course not found</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Hero Header */}
            <div className="relative h-64 md:h-96 bg-slate-900 border-b border-slate-200">
                <img src={course.image} className="w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
                    <Link href="/reskill/courses" className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                </nav>

                <div className="absolute bottom-12 left-6 right-6 max-w-4xl mx-auto text-white">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {course.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mt-6 leading-tight tracking-tight">{course.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-400" />
                            <span className="text-sm font-bold text-slate-300">{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Award size={16} className="text-amber-400" />
                            <span className="text-sm font-bold text-slate-300">{course.level}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Curriculum List */}
                <div className="md:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-blue-600" />
                            カリキュラム
                        </h2>
                        <div className="space-y-4">
                            {course.curriculums.map((curr) => (
                                <div key={curr.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Step {curr.order}</span>
                                            <h3 className="text-lg font-black text-slate-800">{curr.title}</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {curr.lessons.map((lesson) => (
                                            <Link
                                                key={lesson.id}
                                                href={`/reskill/lesson/${lesson.id}`}
                                                className="flex items-center justify-between p-4 bg-white hover:bg-white hover:shadow-md rounded-2xl transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isLessonCompleted(lesson.id) ? (
                                                        <CheckCircle2 size={18} className="text-emerald-500" />
                                                    ) : (
                                                        <PlayCircle size={18} className="text-slate-300 group-hover:text-blue-600" />
                                                    )}
                                                    <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 line-clamp-1">{lesson.title}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400">{lesson.duration}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Intro */}
                <div className="space-y-10">
                    <section className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Instructor</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <img src={course.instructor.image} className="w-16 h-16 rounded-full border-4 border-white shadow-lg" alt="" />
                            <div>
                                <p className="font-black text-slate-900">{course.instructor.name}</p>
                                <p className="text-xs font-bold text-slate-500 leading-tight mt-1">{course.instructor.role}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            愛媛の地方創生とDXを牽引するエキスパート。現場での豊富な経験を活かし、実践的なスキルを伝授します。
                        </p>
                    </section>

                    <Link
                        href={`/reskill/lesson/${course.curriculums[0].lessons[0].id}`}
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/40 hover:bg-slate-800 active:scale-95 transition-all group"
                    >
                        コースを始める <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
