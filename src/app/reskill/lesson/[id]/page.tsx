"use client";

import React, { useState, useEffect, use, useRef } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    ChevronLeft, FileText, Download, CheckSquare,
    PlayCircle, CheckCircle2, ChevronRight, Menu,
    Award, XCircle, Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LessonPlayerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const {
        courses,
        fetchCourses,
        completeLesson,
        updateLastViewedLesson,
        isLessonCompleted,
        isLessonSidebarOpen: isSidebarOpen,
        setLessonSidebarOpen: setIsSidebarOpen
    } = useAppStore();

    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
    }, [courses.length, fetchCourses]);

    // Find lesson and course
    const allLessons = courses.flatMap(c => (c.curriculums || []).flatMap(curr => curr.lessons));
    const lesson = allLessons.find(l => l.id === id);
    const course = courses.find(c => (c.curriculums || []).some(curr => curr.id === lesson?.curriculumId));
    const curriculum = course?.curriculums?.find(curr => curr.id === lesson?.curriculumId);

    // --- YouTube API Integration ---
    const playerRef = useRef<any>(null);

    const handleComplete = React.useCallback(() => {
        if (!lesson) return;
        completeLesson(lesson.id);
        setShowCelebration(true);
        toast.success('レッスンを完了しました！');
        setTimeout(() => setShowCelebration(false), 3000);
    }, [lesson, completeLesson]);

    useEffect(() => {
        // Only proceed if we have a lesson
        if (!lesson) return;

        // Load YouTube API
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        // Initialize Player helper
        const initPlayer = () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }

            const videoId = lesson.youtubeUrl.split('/').pop()?.split('?')[0];

            playerRef.current = new (window as any).YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'rel': 0,
                    'modestbranding': 1,
                },
                events: {
                    'onStateChange': (event: any) => {
                        // YT.PlayerState.ENDED is 0
                        if (event.data === 0) {
                            handleComplete();
                        }
                    }
                }
            });
        };

        // If API already loaded, init now, otherwise wait for callback
        if ((window as any).YT && (window as any).YT.Player) {
            initPlayer();
        } else {
            (window as any).onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [lesson?.id]); // Re-init when lesson changes

    useEffect(() => {
        if (lesson) {
            updateLastViewedLesson(lesson.id);
        }
    }, [lesson?.id, updateLastViewedLesson]);

    if (!lesson || !course) return <div>Lesson not found</div>;

    const handleQuizSubmit = () => {
        setQuizSubmitted(true);
        const allCorrect = lesson.quiz?.every((q, idx) => selectedAnswers[q.id] === q.correctAnswerIndex);
        if (allCorrect) {
            toast.success('正解です！よく理解できました。');
        } else {
            toast.error('一部誤りがあります。解説を確認しましょう。');
        }
    };

    const nextLesson = allLessons.find(l =>
        l.curriculumId === lesson.curriculumId && l.order === lesson.order + 1
    ) || allLessons.find(l => {
        const currIdx = (course.curriculums || []).findIndex(c => c.id === lesson.curriculumId);
        return (course.curriculums || [])[currIdx + 1]?.lessons[0];
    });

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between text-white z-40">
                <div className="flex items-center gap-4">
                    <Link href="/reskill" className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{course.title}</span>
                        <h1 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{lesson.title}</h1>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400"
                >
                    <Menu size={20} />
                </button>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-950">
                    <div className="bg-black aspect-video w-full shadow-2xl relative">
                        <div id="youtube-player" className="w-full h-full" />
                    </div>

                    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10 pb-32">
                        {/* Lesson Info */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-white mb-4 tracking-tight">{lesson.title}</h2>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    {lesson.description}
                                </p>
                            </div>
                            <div className="shrink-0 flex gap-3">
                                <button
                                    onClick={handleComplete}
                                    className={`relative px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2 overflow-hidden ${isLessonCompleted(lesson.id)
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40'
                                        }`}
                                >
                                    {isLessonCompleted(lesson.id) ? <CheckCircle2 size={20} /> : null}
                                    {isLessonCompleted(lesson.id) ? '完了済み' : '完了にする'}
                                    {showCelebration && (
                                        <div className="absolute inset-0 bg-white/20 animate-ping" />
                                    )}
                                </button>
                                {nextLesson && (
                                    <Link
                                        href={`/reskill/lesson/${nextLesson.id}`}
                                        className="p-4 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all border border-white/5"
                                    >
                                        <ChevronRight size={24} />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Interactive Tabs/Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Attachments */}
                            {lesson.attachments && lesson.attachments.length > 0 && (
                                <div className="bg-slate-900 rounded-[2rem] p-8 border border-white/5">
                                    <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6">
                                        <FileText className="text-blue-500" /> 学習資料
                                    </h3>
                                    <div className="space-y-3">
                                        {lesson.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.url}
                                                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-none">{file.name}</p>
                                                        <span className="text-[10px] text-slate-500 font-bold">{file.size}</span>
                                                    </div>
                                                </div>
                                                <Download size={18} className="text-slate-400" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quiz Entry */}
                            {lesson.quiz && (
                                <div
                                    className={`bg-slate-900 rounded-[2rem] p-8 border ${isQuizOpen ? 'border-amber-500/30 ring-1 ring-amber-500/30' : 'border-white/5 hover:border-amber-500/20'} transition-all cursor-pointer`}
                                    onClick={() => !isQuizOpen && setIsQuizOpen(true)}
                                >
                                    <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                                        <CheckSquare className="text-amber-500" /> 理解度テスト
                                    </h3>
                                    <p className="text-sm text-slate-400 font-bold mb-6">
                                        このレッスンのポイントを復習しましょう（{lesson.quiz.length}門）
                                    </p>
                                    {!isQuizOpen && (
                                        <button className="text-amber-500 font-black text-sm flex items-center gap-1 hover:translate-x-1 transition-transform">
                                            テストを開始する <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quiz Detail Section (when open) */}
                        {isQuizOpen && lesson.quiz && (
                            <section className="bg-slate-900 rounded-[2.5rem] p-10 border border-amber-500/30 space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-white italic">Practice Test</h3>
                                    <button onClick={() => setIsQuizOpen(false)} className="text-slate-500 hover:text-white">Close</button>
                                </div>
                                <div className="space-y-10">
                                    {lesson.quiz.map((q, qIdx) => (
                                        <div key={q.id} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                                                    Q{qIdx + 1}
                                                </span>
                                                <p className="text-lg font-bold text-white leading-tight">
                                                    {q.question}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {q.options.map((opt, optIdx) => {
                                                    const isSelected = selectedAnswers[q.id] === optIdx;
                                                    const isCorrect = optIdx === q.correctAnswerIndex;
                                                    let statusClass = 'bg-white/5 border-white/10 text-white hover:bg-white/10';

                                                    if (quizSubmitted) {
                                                        if (isCorrect) {
                                                            statusClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/20';
                                                        } else if (isSelected) {
                                                            statusClass = 'bg-red-500/10 border-red-500 text-red-400';
                                                        } else {
                                                            statusClass = 'bg-white/2 border-white/5 text-slate-600 opacity-50';
                                                        }
                                                    } else if (isSelected) {
                                                        statusClass = 'bg-blue-500/20 border-blue-500 text-blue-400';
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            disabled={quizSubmitted}
                                                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: optIdx })}
                                                            className={`p-4 rounded-2xl text-left font-bold transition-all border flex items-center justify-between group ${statusClass}`}
                                                        >
                                                            <span>{opt}</span>
                                                            {quizSubmitted && isCorrect && <CheckCircle2 size={18} className="text-emerald-500" />}
                                                            {quizSubmitted && isSelected && !isCorrect && <XCircle size={18} className="text-red-500" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizSubmitted && q.explanation && (
                                                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs font-medium text-blue-300 leading-relaxed italic animate-in zoom-in-95 duration-300">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Lightbulb size={14} className="text-blue-400" />
                                                        <span className="font-black uppercase tracking-widest text-[10px]">Explanation</span>
                                                    </div>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {!quizSubmitted ? (
                                    <button
                                        onClick={handleQuizSubmit}
                                        className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-900/20"
                                    >
                                        回答を送信する
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setQuizSubmitted(false);
                                            setSelectedAnswers({});
                                            setIsQuizOpen(false);
                                        }}
                                        className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all border border-white/5"
                                    >
                                        回答をクリア
                                    </button>
                                )}
                            </section>
                        )}
                    </div>
                </main>

                {/* Sidebar Navigation */}
                {isSidebarOpen && (
                    <aside className="hidden lg:flex w-80 bg-slate-900 border-l border-white/10 flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="font-black text-white text-lg tracking-tight">Curriculum Contents</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {(course.curriculums || []).map((curr) => (
                                <div key={curr.id}>
                                    <div className="px-6 py-4 bg-white/5 border-b border-white/5">
                                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Step {curr.order}</span>
                                        <h4 className="text-sm font-black text-slate-300">{curr.title}</h4>
                                    </div>
                                    <div className="py-2">
                                        {curr.lessons.map((l) => (
                                            <Link
                                                key={l.id}
                                                href={`/reskill/lesson/${l.id}`}
                                                className={`flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition-colors group ${l.id === id ? 'bg-blue-600/10 text-blue-400 border-l-4 border-blue-600' : 'text-slate-400'
                                                    }`}
                                            >
                                                <div className="shrink-0">
                                                    {isLessonCompleted(l.id) ? (
                                                        <CheckCircle2 size={18} className="text-emerald-500" />
                                                    ) : (
                                                        <PlayCircle size={18} className={l.id === id ? 'text-blue-600' : 'group-hover:text-white'} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold leading-snug line-clamp-2 ${l.id === id ? 'text-blue-400' : 'group-hover:text-slate-200'}`}>
                                                        {l.title}
                                                    </p>
                                                    <span className="text-[10px] opacity-50">{l.duration}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
