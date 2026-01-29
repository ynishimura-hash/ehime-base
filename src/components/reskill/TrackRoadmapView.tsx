'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Lock, Play, Flag, MapPin, BookOpen, Clock, ChevronDown, Trophy, Zap } from 'lucide-react';
import { Course, LearningTrack } from '@/types/shared';

interface TrackRoadmapViewProps {
    track: LearningTrack;
    courses: Course[];
    completedLessonIds: string[];
    onCourseSelect: (courseId: string) => void;
}

export default function TrackRoadmapView({ track, courses, completedLessonIds, onCourseSelect }: TrackRoadmapViewProps) {
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [lineWidth, setLineWidth] = useState(0);

    // Filter courses that belong to this track
    // If track.courseIds is empty/undefined, we might want to show all provided 'courses' if they are already filtered by parent?
    // In reskill/page.tsx, 'courses' ARE specific to the track.
    // But let's stick to the ID filtering if provided.
    const trackCourses = courses.filter(c => track.courseIds.includes(c.id));

    console.log('TrackRoadmapView: Info', {
        trackTitle: track.title,
        providedCourses: courses.length,
        trackCourseIds: track.courseIds.length,
        filteredCourses: trackCourses.length
    });

    console.log('TrackRoadmapView: rendered', {
        trackId: track.id,
        courseIds: track.courseIds,
        coursesCount: courses.length,
        resolvedCourses: trackCourses.length
    });

    // Update line width on mount and resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                // Calculate width from start of first item to center of goal
                // For simplicity, we just make it span the scroll width with some padding
                setLineWidth(containerRef.current.scrollWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [trackCourses.length]);


    if (trackCourses.length === 0) return null;

    // --- Statistics ---
    // --- Statistics ---
    const allTrackLessons = trackCourses.flatMap(c => c.lessons || c.curriculums?.flatMap(curr => curr.lessons) || []);
    const totalTrackLessons = allTrackLessons.length;
    const completedTrackLessons = allTrackLessons.filter(l => completedLessonIds.includes(l.id)).length;
    const trackProgress = totalTrackLessons > 0 ? Math.round((completedTrackLessons / totalTrackLessons) * 100) : 0;

    return (
        <div className="w-full">
            {/* 1. Header: Curriculum Info & Overall Progress */}
            <div className="mb-12 px-2 md:px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                                Official Curriculum
                            </span>
                            <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                <Clock size={12} /> Total {Math.round(totalTrackLessons * 15 / 60)}h Est.
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                            {track.title}
                        </h2>
                        <p className="text-slate-500 font-medium mt-3 max-w-2xl leading-relaxed">
                            {track.description}
                        </p>
                    </div>

                    {/* Overall Progress Badge */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-4 min-w-[200px]">
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-blue-600 drop-shadow-md" strokeDasharray={`${trackProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <span className="absolute text-sm font-black text-slate-700">{trackProgress}%</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL STATUS</p>
                            <p className="font-black text-slate-800 text-lg">
                                {trackProgress === 100 ? 'COMPLETED' : 'IN PROGRESS'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Scrollable Roadmap Container */}
            <div className="relative w-full overflow-x-auto overflow-y-hidden pb-16 pt-8 px-4 hide-scrollbar" ref={containerRef}>
                <div className="flex items-start gap-8 min-w-max px-4 relative">

                    {/* Connector Lines (Behind) */}
                    {/* Positioned relative to the flex container content. Left 2rem aligns approximately with Start Node center. Right 2rem with Goal. */}
                    <div className="absolute top-[3.5rem] left-[3rem] right-[3rem] h-1 bg-slate-100 -z-10 rounded-full" />
                    <div
                        className="absolute top-[3.5rem] left-[3rem] h-1 bg-blue-500 -z-10 rounded-full transition-all duration-1000"
                        style={{ width: `calc(${Math.max(0, trackProgress)}% - 6rem)` }}
                    />

                    {/* START Node */}
                    <div className="flex flex-col items-center mt-3 flex-shrink-0 w-24">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white z-10">
                            <MapPin size={20} />
                        </div>
                        <div className="mt-3 font-black text-slate-400 text-[10px] tracking-widest uppercase">Start</div>
                    </div>

                    {/* Courses */}
                    {trackCourses.map((course, index) => {
                        const allLessons = course.lessons || course.curriculums?.flatMap(c => c.lessons) || [];
                        const totalLessons = allLessons.length;
                        const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
                        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
                        const isComplete = progress === 100 && totalLessons > 0;

                        // Locked Rule
                        const prevCourse = index > 0 ? trackCourses[index - 1] : null;
                        const prevAllLessons = prevCourse
                            ? (prevCourse.lessons || prevCourse.curriculums?.flatMap(c => c.lessons) || [])
                            : [];
                        const isPrevComplete = prevCourse
                            ? prevAllLessons.every(l => completedLessonIds.includes(l.id))
                            : true;

                        const isLocked = index > 0 && !isPrevComplete;
                        const isActive = !isLocked && !isComplete;
                        const isExpanded = expandedCourseId === course.id;

                        return (
                            <div
                                key={course.id}
                                className="relative flex flex-col items-center group w-[280px] flex-shrink-0"
                            >
                                {/* Marker Node on Line */}
                                <div className={`
                                    w-6 h-6 rounded-full border-4 z-10 mb-6 transition-colors duration-500
                                    ${isComplete ? 'bg-white border-emerald-500' :
                                        isActive ? 'bg-blue-600 border-blue-200 ring-4 ring-blue-100' :
                                            'bg-slate-100 border-slate-200'}
                                `}>
                                    {isActive && (
                                        <span
                                            className="absolute -inset-1 rounded-full bg-blue-400 opacity-30 pointer-events-none"
                                            style={{
                                                animation: 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite'
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Card */}
                                <div
                                    role="button"
                                    tabIndex={isLocked ? -1 : 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Card clicked, isLocked:', isLocked, 'courseId:', course.id);
                                        if (!isLocked) {
                                            onCourseSelect(course.id);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
                                            e.preventDefault();
                                            onCourseSelect(course.id);
                                        }
                                    }}
                                    className={`
                                        w-full bg-white rounded-3xl border-2 transition-all cursor-pointer overflow-hidden select-none
                                        ${isLocked ? 'border-slate-300 bg-slate-100 grayscale-[0.8] opacity-100 cursor-not-allowed' :
                                            isActive ? 'border-blue-500 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/10' :
                                                'border-slate-200 shadow-lg shadow-slate-200/50 hover:border-blue-300'}
                                    `}
                                >
                                    {/* Main Content (Always Visible) - pointer-events-none to ensure clicks go to parent */}
                                    <div className="p-5 pointer-events-none">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`
                                                px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border
                                                ${isComplete ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    isLocked ? 'bg-slate-200 text-slate-500 border-slate-300' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'}
                                            `}>
                                                Step {index + 1}
                                            </span>
                                            {isComplete && <Check size={16} className="text-emerald-500" />}
                                            {isLocked && <Lock size={16} className="text-slate-400" />}
                                        </div>

                                        <h3 className={`text-lg font-black leading-tight mb-2 line-clamp-2 ${isLocked ? 'text-slate-500' : 'text-slate-800'}`}>
                                            {course.title}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-400 line-clamp-2 min-h-[2.5em]">
                                            {course.description}
                                        </p>

                                        {/* Progress or Call to Action */}
                                        {!isLocked && (
                                            <div className="mt-4">
                                                {progress > 0 && progress < 100 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-blue-500"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-black text-blue-500">{progress}%</span>
                                                    </div>
                                                ) : (
                                                    <div className={`mt-2 text-xs font-black flex items-center gap-1 ${isComplete ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                        {isComplete ? '復習する' : '開始する'} <Play size={12} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* GOAL Node */}
                    <div className="flex flex-col items-center mt-3 ml-4 flex-shrink-0 w-24">
                        <div className={`
                            w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-white z-10 transition-colors
                            ${trackProgress === 100 ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white' : 'bg-slate-100 text-slate-300'}
                        `}>
                            <Trophy size={28} fill={trackProgress === 100 ? "currentColor" : "none"} />
                        </div>
                        <div className="mt-3 font-black text-slate-300 text-[10px] tracking-widest uppercase">Goal</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
