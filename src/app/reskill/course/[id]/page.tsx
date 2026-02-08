"use client";

import React, { use } from 'react';
import { ChevronLeft, PlayCircle, Clock, Award, BookOpen, CheckCircle2, ArrowRight, Play, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/appStore';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { getYoutubeId } from '@/utils/youtube';

import { ElearningService } from '@/services/elearning';
import { AffinitySection } from './AffinitySection';

// --- Lesson Preview Component ---
const LessonPreviewItem = ({ lesson, index, isCompleted }: { lesson: any, index: number, isCompleted: boolean }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    // YouTube ID extraction
    const videoId = getYoutubeId(lesson.url || lesson.youtubeUrl || lesson.youtube_url);
    const thumbnailUrl = lesson.thumbnail_url || lesson.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

    // Timer for 1 minute limit
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setTimeout(() => {
                setIsPlaying(false);
                toast.info('プレビュー再生は1分までです。詳細は本編でご覧ください。', {
                    duration: 5000,
                    icon: '🔒'
                });
            }, 60000); // 60 seconds limit
        }
        return () => clearTimeout(timer);
    }, [isPlaying]);

    const handleThumbnailClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!videoId) return;

        setIsPlaying(!isPlaying);
    };

    return (
        <div className={`group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 hover:shadow-md border rounded-2xl transition-all ${isCompleted ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 hover:bg-white border-slate-100'}`}>
            {/* Thumbnail Area */}
            <div
                className="w-full md:w-56 aspect-video bg-slate-200 rounded-xl overflow-hidden relative cursor-pointer flex-shrink-0 shadow-inner group-hover:shadow-md transition-all"
                onClick={handleThumbnailClick}
            >
                {isPlaying && videoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <>
                        {thumbnailUrl && !imgError ? (
                            <img
                                src={thumbnailUrl}
                                alt={lesson.title}
                                className={`w-full h-full object-cover transition-opacity transform group-hover:scale-105 duration-500 ${isCompleted ? 'opacity-60 grayscale-[30%]' : 'opacity-90 group-hover:opacity-100'}`}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                                <PlayCircle size={32} />
                            </div>
                        )}

                        {/* Overlay Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                                <Play size={24} className="text-blue-600 ml-1 fill-blue-600" />
                            </div>
                        </div>

                        {/* Completed Badge */}
                        {isCompleted && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1 z-10">
                                <CheckCircle2 size={12} /> 視聴済み
                            </div>
                        )}

                        {/* Duration Badge */}
                        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock size={10} /> {lesson.duration}
                        </span>
                    </>
                )}
            </div>

            {/* Info Area */}
            <div className="flex-1 min-w-0 w-full py-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-2">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-sm">Lesson {index + 1}</span>
                    {lesson.hasQuiz && (
                        <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Quiz
                        </span>
                    )}
                </div>

                <Link href={`/reskill/lesson/${lesson.id}`} className="block group-hover:text-blue-600 transition-colors">
                    <h3 className="text-base font-black text-slate-800 line-clamp-2 mb-2 leading-snug">
                        {lesson.title}
                    </h3>
                </Link>

                <div className="flex items-center gap-4 mt-4">
                    <Link
                        href={`/reskill/lesson/${lesson.id}`}
                        className={`text-xs font-bold hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isCompleted
                            ? 'bg-emerald-100 text-emerald-700 hover:text-emerald-800'
                            : 'bg-blue-50 text-blue-600 hover:text-blue-700'
                            }`}
                    >
                        {isCompleted ? '復習する' : '受講する'} <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
};



export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isLessonCompleted, courses, fetchCourses, userAnalysis, users, currentUserId, isFetchingCourses } = useAppStore();
    const [loading, setLoading] = React.useState(true);

    // Get current user name safely
    const currentUser = users.find(u => u.id === currentUserId);
    const userName = currentUser?.lastName ? `${currentUser.lastName} ${currentUser.firstName}` : "あなた";

    useEffect(() => {
        // Track view
        if (id) {
            ElearningService.incrementViewCount(id);
        }

        if (courses.length === 0 && !isFetchingCourses) {
            fetchCourses().finally(() => setLoading(false));
        } else if (courses.length > 0) {
            setLoading(false);
        }
    }, [id, courses.length, fetchCourses, isFetchingCourses]);

    // First try to find as a top-level course (from /reskill/courses page)
    let course = Array.isArray(courses) ? courses.find((c: any) => c.id === id) : undefined;

    // If not found at top level, search within nested curriculums (for roadmap navigation)
    if (!course && Array.isArray(courses)) {
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

    // Fallback: Fetch single course directly if not found in store OR if it has no lessons
    // Create local state for fetched course to avoid re-renders loop if we just set it to 'course' variable
    const [fetchedCourse, setFetchedCourse] = React.useState<any>(null);

    // コースがストアにあってもレッスンがなければ詳細を取得する
    const storeCourseHasNoLessons = course && (!course.lessons || course.lessons.length === 0) &&
        (!course.curriculums || course.curriculums.every((c: any) => !c.lessons || c.lessons.length === 0));

    useEffect(() => {
        // Wait for main courses fetch to complete before trying fallback
        const needsFetch = (!course || storeCourseHasNoLessons) && id && !fetchedCourse && !isFetchingCourses;

        if (needsFetch) {
            console.log('Course needs detailed fetch:', id, { courseExists: !!course, hasNoLessons: storeCourseHasNoLessons });
            setLoading(true);
            // まずmodulesから取得を試す（コース一覧もmodulesを使用）
            ElearningService.getModule(id)
                .then((data: any) => {
                    if (data && !data.error) {
                        setFetchedCourse(data);
                    } else {
                        // modulesで見つからない場合はcoursesを試す
                        return fetch(`/api/elearning/courses/${id.toLowerCase()}`)
                            .then(res => res.ok ? res.json() : null)
                            .then(courseData => {
                                if (courseData && !courseData.error) {
                                    setFetchedCourse(courseData);
                                }
                            });
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [course, storeCourseHasNoLessons, id, fetchedCourse, isFetchingCourses]);

    // Use fetched course if it has more data (lessons) than store course
    if (fetchedCourse) {
        course = fetchedCourse;
    }

    // Flatten lessons from curriculums if they exist
    const allLessons = course?.lessons || course?.curriculums?.flatMap((curr: any) => curr.lessons || []) || [];

    const [isExpanded, setIsExpanded] = React.useState(false);
    const displayedLessons = isExpanded ? allLessons : allLessons.slice(0, 3);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">読み込み中...</div>;
    if (!course) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="font-bold text-slate-400 text-lg">講座が見つかりません</div>
            <Link href="/reskill/courses" className="text-blue-600 font-bold hover:underline">講座一覧に戻る</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Bright Hero Header */}
            <div className="relative pt-8 pb-12 bg-white border-b border-slate-100">
                <nav className="max-w-6xl mx-auto px-6 mb-8 flex items-center justify-between">
                    <Link href="/reskill" className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center gap-2 font-bold text-sm">
                        <ChevronLeft size={20} />
                        戻る
                    </Link>
                    <div className="text-xs font-bold text-slate-400">講座詳細</div>
                </nav>

                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
                    <div className="md:col-span-2">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-4 inline-block">
                            {course.category || '講座'}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight tracking-tight mb-4">{course.title}</h1>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">{course.description}</p>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-600">{allLessons.length} レッスン</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={16} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-600">修了証あり</span>
                            </div>
                        </div>
                    </div>

                    {/* Cover Image Area */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-100 border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                        {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <BookOpen size={48} className="text-white/30" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Lessons List */}
                <div className="md:col-span-2">
                    {/* Affinity Section */}
                    <AffinitySection
                        course={course}
                        courseId={id}
                        userId={currentUserId}
                        userAnalysis={userAnalysis}
                        userName={userName}
                    />

                    <section>
                        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-blue-600" size={20} />
                            カリキュラム
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-4 relative">
                                {allLessons.length > 0 ? (
                                    <>
                                        {displayedLessons.map((lesson: any, index: number) => (
                                            <LessonPreviewItem
                                                key={lesson.id}
                                                lesson={lesson}
                                                index={index}
                                                isCompleted={isLessonCompleted(lesson.id)}
                                            />
                                        ))}

                                        {/* Gradient Mask when collapsed */}
                                        {!isExpanded && allLessons.length > 3 && (
                                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                        レッスンはまだありません。
                                    </div>
                                )}
                            </div>

                            {allLessons.length > 3 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="w-full mt-4 py-3 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {isExpanded ? (
                                        <>閉じる <ChevronUp size={16} /></>
                                    ) : (
                                        <>もっと見る ({allLessons.length - 3}件) <ChevronDown size={16} /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 sticky top-6 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">アクション</h3>

                        {allLessons[0] ? (
                            <Link
                                href={`/reskill/lesson/${allLessons[0].id}`}
                                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all group"
                            >
                                学習を始める <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <button disabled className="w-full bg-slate-100 text-slate-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
                                準備中
                            </button>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-800 mb-2">この講座について</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {course.description || "基礎から応用まで、効率的にスキルを習得できる構成になっています。"}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
