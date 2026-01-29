"use client";

import React, { use } from 'react';
import { ChevronLeft, PlayCircle, Clock, Award, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { useEffect } from 'react';

import { ElearningService } from '@/services/elearning';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isLessonCompleted, courses, fetchCourses } = useAppStore();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        // Track view
        if (id) {
            ElearningService.incrementViewCount(id);
        }

        if (courses.length === 0) {
            fetchCourses().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [id, courses.length, fetchCourses]);

    // First try to find as a top-level course (from /reskill/courses page)
    let course = courses.find((c: any) => c.id === id);

    // If not found at top level, search within nested curriculums (for roadmap navigation)
    if (!course) {
        for (const c of courses) {
            const foundCurriculum = c.curriculums?.find((curr: any) => curr.id === id);
            if (foundCurriculum) {
                course = {
                    ...foundCurriculum,
                    image: c.image, // Use parent course image as fallback
                    category: c.category,
                    level: c.level,
                    instructor: c.instructor,
                };
                break;
            }
        }
    }

    // Flatten lessons from curriculums if they exist
    const allLessons = course?.lessons || course?.curriculums?.flatMap((curr: any) => curr.lessons || []) || [];

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>;
    if (!course) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="font-bold text-slate-400 text-lg">Course not found</div>
            <Link href="/reskill/courses" className="text-blue-600 font-bold hover:underline">Return to Courses</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Hero Header */}
            <div className="relative h-64 md:h-80 bg-slate-900 border-b border-slate-200">
                {/* Fallback image or specific cover */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                <div className="absolute inset-0 bg-black/20" />

                <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
                    <Link href="/reskill" className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                </nav>

                <div className="absolute bottom-12 left-6 right-6 max-w-4xl mx-auto text-white z-10">
                    <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg mb-4 inline-block">
                        Module
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">{course.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 mt-4 opacity-90">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-400" />
                            <span className="text-sm font-bold text-slate-300">{allLessons.length} Lessons</span>
                        </div>
                    </div>
                    <p className="mt-4 text-slate-300 max-w-2xl text-sm leading-relaxed">{course.description}</p>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Lessons List */}
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-blue-600" size={20} />
                            レッスン一覧
                        </h2>
                        <div className="space-y-3">
                            {allLessons.length > 0 ? (
                                allLessons.map((lesson: any, index: number) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/reskill/lesson/${lesson.id}`}
                                        className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-black text-slate-300 border border-slate-200 flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-1 break-all">
                                                    {lesson.title}
                                                </h3>
                                                {lesson.quiz && (
                                                    <span className="text-[10px] text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">Quiz</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                            <span className="text-[11px] font-medium text-slate-400">{lesson.duration}</span>
                                            {isLessonCompleted(lesson.id) ? (
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                            ) : (
                                                <PlayCircle size={18} className="text-slate-300 group-hover:text-blue-600" />
                                            )}
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                    No lessons available yet.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 sticky top-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Action</h3>

                        {allLessons[0] ? (
                            <Link
                                href={`/reskill/lesson/${allLessons[0].id}`}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-blue-600 transition-all group"
                            >
                                Start Learning <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <button disabled className="w-full bg-slate-200 text-slate-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                                Coming Soon
                            </button>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h4 className="text-xs font-bold text-slate-800 mb-2">About this module</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {course.description || "Master the fundamentals efficiently."}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
