'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Play, Star, Flag, MapPin } from 'lucide-react';
import { Course } from '@/types/shared';

interface RoadmapViewProps {
    course: Course;
    completedLessonIds: string[];
    onLessonSelect: (lessonId: string) => void;
}

export default function RoadmapView({ course, completedLessonIds, onLessonSelect }: RoadmapViewProps) {
    if (!course?.curriculums) return null;

    // Flatten logic for simple linear roadmap, OR grouped by curriculum
    // The requirement asks for "Curriculum cards connected by lines"
    // Let's visualize Curriculums as major nodes, and maybe expandable or just summary status

    // Layout configuration
    const CARD_WIDTH = 280;
    const CARD_HEIGHT = 160;
    const GAP_Y = 80;
    const GAP_X_OFFSET = 60; // Zig-zag effect offset

    return (
        <div className="relative py-20 px-4 flex flex-col items-center">

            {/* Start Node */}
            <div className="mb-12 flex flex-col items-center z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 ring-4 ring-white">
                    <MapPin size={32} strokeWidth={2.5} />
                </div>
                <div className="bg-white px-4 py-1 rounded-full shadow-sm mt-3 font-black text-slate-500 text-xs tracking-widest uppercase">
                    Start
                </div>
            </div>

            {/* Curriculum Nodes */}
            <div className="relative w-full max-w-md mx-auto">
                {course.curriculums.sort((a, b) => a.order - b.order).map((curr, index) => {
                    // Status Calculation
                    const totalLessons = curr.lessons.length;
                    const completed = curr.lessons.filter(l => completedLessonIds.includes(l.id)).length;
                    const isComplete = totalLessons > 0 && completed === totalLessons;
                    const isLocked = index > 0 && !completedLessonIds.some(id =>
                        (course.curriculums || [])[index - 1].lessons.some(l => l.id === id)
                    ); // Simple lock logic: prev curriculum started? Or strictly prev complete? Simple: prev must be at least touched? Let's say: prev complete? 
                    // Actually let's assume if prev is complete, this is unlock.
                    // Better: isLocked if index > 0 && prev curriculum not complete.
                    const prevCurr = index > 0 ? (course.curriculums || [])[index - 1] : null;
                    const prevComplete = prevCurr ? prevCurr.lessons.every(l => completedLessonIds.includes(l.id)) : true;
                    // Actually simpler: locked if not prevComplete.
                    const locked = index > 0 && !prevComplete;

                    const isActive = !locked && !isComplete;

                    return (
                        <div key={curr.id} className="relative flex flex-col items-center mb-24 last:mb-0 group cursor-pointer"
                            onClick={() => {
                                if (!locked) {
                                    // Find first uncompleted lesson or first lesson
                                    const nextLesson = curr.lessons.find(l => !completedLessonIds.includes(l.id)) || curr.lessons[0];
                                    if (nextLesson) onLessonSelect(nextLesson.id);
                                }
                            }}
                        >
                            {/* Connector Line (to previous) */}
                            {index > 0 && (
                                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-1 h-24 bg-slate-200 -z-10">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: locked ? '0%' : '100%' }}
                                        transition={{ duration: 1, delay: index * 0.2 }}
                                        className="w-full bg-blue-500/30"
                                    />
                                </div>
                            )}

                            {/* Card Body */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    w-full bg-white rounded-3xl p-6 border-2 shadow-xl transition-all relative overflow-hidden
                                    ${locked ? 'border-slate-100 grayscale opacity-80' :
                                        isComplete ? 'border-emerald-400 shadow-emerald-100' :
                                            'border-blue-500 shadow-blue-200 scale-105 ring-4 ring-blue-50'}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute top-0 right-0 p-3">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className={`
                                        w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md
                                        ${locked ? 'bg-slate-200' : isComplete ? 'bg-emerald-500' : 'bg-blue-600'}
                                    `}>
                                        <span className="font-black text-lg">{index + 1}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROGRESS</span>
                                        <p className={`font-black text-xl ${isComplete ? 'text-emerald-500' : locked ? 'text-slate-300' : 'text-blue-600'}`}>
                                            {Math.round((completed / totalLessons) * 100)}%
                                        </p>
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 mb-4">
                                    {curr.title}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    {curr.lessons.slice(0, 3).map((lesson, i) => (
                                        <div key={lesson.id} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            {completedLessonIds.includes(lesson.id) ? (
                                                <Check size={14} className="text-emerald-500" />
                                            ) : (
                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />
                                            )}
                                            <span className="line-clamp-1">{lesson.title}</span>
                                        </div>
                                    ))}
                                    {curr.lessons.length > 3 && (
                                        <div className="text-[10px] text-slate-400 pl-6">
                                            + {curr.lessons.length - 3} more lessons
                                        </div>
                                    )}
                                </div>

                                {locked ? (
                                    <div className="flex items-center justify-center gap-2 bg-slate-100 py-3 rounded-xl text-slate-400 font-bold text-sm">
                                        <Lock size={16} /> Locked
                                    </div>
                                ) : (
                                    <button className={`
                                        w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors
                                        ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'}
                                    `}>
                                        {isComplete ? (
                                            <> <Check size={18} /> Complete </>
                                        ) : (
                                            <> <Play size={18} fill="currentColor" /> Resume </>
                                        )}
                                    </button>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Goal Node */}
            <div className="mt-12 flex flex-col items-center">
                {/* Final Connector */}
                <div className="w-1 h-12 bg-slate-200 mb-4" />

                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-200 rotate-3 hover:rotate-6 transition-transform">
                    <Flag size={40} fill="currentColor" />
                </div>
                <div className="bg-white px-6 py-2 rounded-full shadow-lg -mt-4 z-10 font-black text-slate-800 tracking-wider">
                    GOAL
                </div>
                <p className="mt-4 text-center text-slate-400 text-xs font-bold w-48">
                    修了証の獲得と<br />キャリアアップのチャンス!
                </p>
            </div>
        </div>
    );
}
