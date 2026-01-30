"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    PlayCircle, CheckCircle2, BookOpen, Clock,
    TrendingUp, Award, ChevronRight, Layout,
    Zap, Star, ArrowRight, Layers, Play, X, Sparkles, Flame
} from 'lucide-react';
import Link from 'next/link';
import TrackRoadmapView from '@/components/reskill/TrackRoadmapView';
import { ElearningService } from '@/services/elearning';

// Helper to extract YouTube ID from URL
const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to get fallback image based on course title
// Only use local paths (starting with /), ignore external URLs
const getCourseImage = (course: { image?: string; title: string }) => {
    // Only use course.image if it's a local path (starts with /)
    if (course.image && course.image.startsWith('/')) {
        return course.image;
    }

    const title = course.title;
    if (title.includes('リスキル')) return '/courses/reskill_archive.png';
    if (title.includes('ITパスポート')) return '/courses/it_passport.png';
    if (title.includes('基本情報')) return '/courses/fe_exam.png';
    if (title.includes('キャリア')) return '/courses/career_support.png';
    if (title.includes('AI')) return '/courses/ai_course.png';
    if (title.includes('SNS') || title.includes('マーケティング')) return '/courses/sns_marketing.png';
    if (title.includes('動画')) return '/courses/video_production.png';
    if (title.includes('アプリ')) return '/courses/app_development.png';
    if (title.includes('自動化')) return '/courses/automation.png';
    if (title.includes('セキュリティ')) return '/courses/security_course.png';
    if (title.includes('Google Apps Script') || title.includes('GAS')) return '/courses/gas_course.png';
    if (title.includes('Google')) return '/courses/google_basics.png';
    if (title.includes('HP') || title.includes('Web') || title.includes('ウェブ')) return '/courses/hp_course.png';
    if (title.includes('DX')) return '/courses/track_dx.png';
    if (title.includes('デジタル')) return '/courses/digital_basics.png';

    return '/courses/digital_basics.png';
};

// Recently Viewed Section Component with YouTube thumbnails and inline play
function RecentlyViewedSection({ lessons, courses, activeTrack }: { lessons: any[]; courses: any[]; activeTrack: any }) {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    return (
        <section>
            <div className="flex items-center justify-between mb-4 mt-12">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Clock className="text-blue-500" />
                    最近見たレッスン
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson: any) => {
                    // Find module containing this lesson
                    const module = courses.find((c: any) => c.lessons && c.lessons.some((l: any) => l.id === lesson.id));
                    // Extract YouTube ID from lesson URL
                    const youtubeId = getYoutubeId(lesson.url);
                    // Use YouTube thumbnail if available, otherwise fallback
                    const thumbnail = youtubeId
                        ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
                        : module?.thumbnail_url || activeTrack?.image || '/illustrations/dx_roadmap.png';

                    const isPlaying = playingVideoId === lesson.id;

                    return (
                        <div
                            key={lesson.id}
                            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                        >
                            <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                {isPlaying && youtubeId ? (
                                    <>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                        <button
                                            onClick={() => setPlayingVideoId(null)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src={thumbnail}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Play button on hover */}
                                        <div
                                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            onClick={() => youtubeId && setPlayingVideoId(lesson.id)}
                                        >
                                            <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                <Play size={24} className="text-slate-900 ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                        {/* Duration badge */}
                                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded">
                                            {lesson.duration || '0:00'}
                                        </div>
                                    </>
                                )}
                            </div>
                            <Link href={`/reskill/lesson/${lesson.id}`} className="block p-5 hover:bg-slate-50 transition-colors">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{module?.title}</span>
                                <h3 className="text-lg font-black text-slate-800 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {lesson.title}
                                </h3>
                            </Link>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function ReskillDashboardPage() {
    // State
    const [tracks, setTracks] = useState<any[]>([]);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');
    const [courses, setCourses] = useState<any[]>([]); // Courses for the selected track
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Fetch Initial Data (Tracks) - runs on mount and on retry
    React.useEffect(() => {
        let isActive = true;

        setIsLoading(true);
        setError(null);

        const fetchTracks = async () => {
            try {
                console.log('ReskillDashboard: Fetching tracks...');
                const fetchedTracks = await ElearningService.getTracks();

                if (!isActive) return;

                const uiTracks = fetchedTracks.map((t: any) => ({
                    ...t,
                    image: t.image || '/illustrations/dx_roadmap.png',
                    courseIds: []
                }));

                console.log('ReskillDashboard: Loaded tracks:', uiTracks.length);
                setTracks(uiTracks);

                if (uiTracks.length > 0) {
                    setSelectedTrackId(uiTracks[0].id);
                } else {
                    setError('No tracks found in database.');
                    setIsLoading(false);
                }
            } catch (e: any) {
                if (!isActive) return;

                console.error("Failed to load tracks:", e?.message || e);
                setError(e.message || 'Failed to load tracks');
                setIsLoading(false);
            }
        };

        fetchTracks();

        return () => { isActive = false; };
    }, [retryCount]);

    // Fetch Courses when Track Changes
    React.useEffect(() => {
        if (!selectedTrackId) return;

        let isActive = true;

        const loadCourses = async () => {
            setIsLoading(true);

            try {
                console.log(`ReskillDashboard: Fetching courses for track ${selectedTrackId}...`);
                const trackCourses = await ElearningService.getCoursesForTrack(selectedTrackId);

                if (!isActive) return;

                console.log(`ReskillDashboard: Fetched ${trackCourses.length} courses.`);
                setCourses(trackCourses);
            } catch (e: any) {
                if (!isActive) return;

                const isAbortError = e?.name === 'AbortError' ||
                    (e?.message && e.message.includes('aborted'));

                if (!isAbortError) {
                    console.error("Failed to load courses for track", e);
                    setCourses([]);
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadCourses();

        return () => { isActive = false; };
    }, [selectedTrackId]);

    // Retry function for the debug panel
    const handleRetry = () => {
        setTracks([]);
        setCourses([]);
        setSelectedTrackId('');
        setRetryCount(c => c + 1);
    };

    // --- Personalization (Dynamic Sorting) ---
    const { userAnalysis, completedLessonIds, lastViewedLessonIds } = useAppStore();

    const sortedTracks = React.useMemo(() => {
        if (!tracks.length) return [];
        if (!userAnalysis?.diagnosisScores || Object.keys(userAnalysis.diagnosisScores).length === 0) return tracks;

        // 1. Determine User's Top Category
        const categories = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        Object.entries(userAnalysis.diagnosisScores).forEach(([qId, score]) => {
            const id = Number(qId);
            if (id <= 10) categories.A += score;
            else if (id <= 20) categories.B += score;
            else if (id <= 30) categories.C += score;
            else if (id <= 40) categories.D += score;
            else categories.E += score;
        });

        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCats[0][0]; // 'A', 'B', 'C', 'D', or 'E'

        console.log('Dashboard: Personalizing for Category', topCategory);

        // 2. Sort Tracks based on affinity
        // A(Idea)/B(Active) -> Suggest DX (Planning/Leadership)
        // C(Steady)/E(Stoic) -> Suggest Web Engineer (Structure/Technical)
        const getScore = (track: any) => {
            const t = (track.title || '').toLowerCase();
            let score = 0;
            // Base score is 0. Matches add points.
            if (topCategory === 'A' || topCategory === 'B') {
                if (t.includes('dx') || t.includes('企画') || t.includes('デザイン')) score += 10;
            }
            if (topCategory === 'C' || topCategory === 'E') {
                if (t.includes('web') || t.includes('エンジニア') || t.includes('開発')) score += 10;
            }
            // If Category D (Empathy) -> maybe preference? For now neutral.
            return score;
        };

        return [...tracks].sort((a, b) => getScore(b) - getScore(a));

    }, [tracks, userAnalysis]);

    // Update selectedTrackId if it's empty and we have tracks
    React.useEffect(() => {
        if (!selectedTrackId && sortedTracks.length > 0) {
            setSelectedTrackId(sortedTracks[0].id);
        }
    }, [sortedTracks, selectedTrackId]);



    // Calculate aggregated stats from the currently loaded course list
    // Note: To get global stats "overallProgress", we might need a separate API or fetch all. 
    // For now, let's calc stats based on the *active track* or leave 0 if not loaded.
    const allLessons = courses.flatMap((c: any) => c.lessons || []);
    const totalLessonsCount = allLessons.length;

    const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
    const overallProgress = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

    // Get recently viewed lessons info (from current track context)
    const recentlyViewedLessons = lastViewedLessonIds.map(id =>
        allLessons.find(l => l.id === id)
    ).filter(Boolean);

    const activeTrackRaw = sortedTracks.find(t => t.id === selectedTrackId);

    // Check if we need to hydrate courseIds
    // If courses are loaded and match this track, we use their IDs.
    // Since 'courses' state is always updated for the 'selectedTrackId', we can trust it matches the active track.
    const activeTrack = activeTrackRaw ? {
        ...activeTrackRaw,
        courseIds: courses.map((c: any) => c.id)
    } : undefined;

    console.log('Dashboard: Render', {
        selectedTrackId,
        activeTrackRaw: activeTrackRaw?.title,
        fetchedCourses: courses.length,
        activeTrackIds: activeTrack?.courseIds.length
    });

    // --- Derived State for Active Module (Course) ---
    const lastLesson = recentlyViewedLessons[0];

    const activeModule = lastLesson
        ? courses.find((c: any) => c.lessons && c.lessons.some((l: any) => l.id === lastLesson.id))
        : courses[0];

    const activeModuleLessons = activeModule?.lessons || [];
    const activeModuleCompletedCount = activeModuleLessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
    const activeCourseProgress = activeModuleLessons.length > 0
        ? Math.round((activeModuleCompletedCount / activeModuleLessons.length) * 100)
        : 0;

    // Aliases for JSX compatibility
    const activeCourse = activeModule;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 w-full min-w-0 overflow-x-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
                            <BookOpen size={24} />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-900">Reskill University</h1>
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

                {/* Main Track Roadmap (Top Level Curriculum) */}

                {/* Curriculum Selection Tabs */}
                <section>
                    <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 pl-4 hide-scrollbar">
                        {sortedTracks.map((track: any) => {
                            const isSelected = track.id === selectedTrackId;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedTrackId(track.id)}
                                    className={`
                                        flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all
                                        ${isSelected
                                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
                                            : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}
                                    `}
                                >
                                    <Layers size={16} className={isSelected ? 'text-blue-400' : 'text-slate-300'} />
                                    {track.title}
                                </button>
                            )
                        })}
                    </div>

                    {activeTrack && courses.length > 0 ? (
                        <section className="bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white/50 shadow-xl overflow-hidden relative">
                            <div className="py-8">
                                <TrackRoadmapView
                                    track={activeTrack}
                                    courses={courses} // Pass all modules
                                    completedLessonIds={completedLessonIds}
                                    onCourseSelect={(courseId) => window.location.href = `/reskill/course/${courseId}`}
                                />
                            </div>
                        </section>
                    ) : (
                        <div className="py-12 text-center bg-white rounded-[3rem] border border-slate-200 border-dashed">
                            <p className="text-slate-400 font-bold">このカリキュラムにはまだコースが登録されていません。</p>
                        </div>
                    )}
                </section>

                {/* Recently Viewed (Alternative List) */}
                {recentlyViewedLessons.length > 0 && (
                    <RecentlyViewedSection
                        lessons={recentlyViewedLessons}
                        courses={courses}
                        activeTrack={activeTrack}
                    />
                )}

                {/* Recommended Courses */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <Star className="text-amber-500" fill="currentColor" />
                            すべてのコース
                        </h2>
                        <Link href="/reskill/courses" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                            すべて見る <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {courses.map((course) => {
                            // Determine recommendation tag
                            const courseCategory = (course.title || '').toLowerCase();
                            const isDiagnosisRecommended = (() => {
                                if (!userAnalysis?.diagnosisScores || Object.keys(userAnalysis.diagnosisScores).length === 0) return false;

                                // Re-calc top category (simplified for render)
                                const categories = { A: 0, B: 0, C: 0, D: 0, E: 0 };
                                Object.entries(userAnalysis.diagnosisScores).forEach(([qId, score]) => {
                                    const id = Number(qId);
                                    if (id <= 10) categories.A += score;
                                    else if (id <= 20) categories.B += score;
                                    else if (id <= 30) categories.C += score;
                                    else if (id <= 40) categories.D += score;
                                    else categories.E += score;
                                });
                                const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
                                const topCategory = sortedCats[0][0];

                                if (topCategory === 'A' || topCategory === 'B') {
                                    if (courseCategory.includes('dx') || courseCategory.includes('企画') || courseCategory.includes('デザイン')) return true;
                                }
                                if (topCategory === 'C' || topCategory === 'E') {
                                    if (courseCategory.includes('web') || courseCategory.includes('エンジニア') || courseCategory.includes('開発')) return true;
                                }
                                return false;
                            })();

                            const isPopular = (course.viewCount || 0) >= 10;
                            const isAdminRecommended = course.tags && (course.tags.includes('Recommended') || course.tags.includes('recommended'));

                            return (
                                <Link
                                    key={course.id}
                                    href={`/reskill/course/${course.id}`}
                                    className="group flex flex-row bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full relative"
                                >
                                    <div className="w-1/3 md:w-2/5 relative shrink-0">
                                        <img src={getCourseImage(course)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={course.title} />
                                        <div className="absolute top-2 left-2 md:top-4 md:left-4">
                                            <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black text-slate-800 shadow-sm border border-slate-100">
                                                {course.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex flex-col gap-1 md:gap-2 items-end">
                                            {isDiagnosisRecommended && (
                                                <span className="bg-amber-400 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1">
                                                    <Sparkles size={12} fill="currentColor" /> あなたにおすすめ
                                                </span>
                                            )}
                                            {isPopular && (
                                                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-rose-400 flex items-center gap-1">
                                                    <Flame size={12} fill="currentColor" /> 人気
                                                </span>
                                            )}
                                            {isAdminRecommended && (
                                                <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-blue-500 flex items-center gap-1">
                                                    <Award size={12} fill="currentColor" /> リスキル大学推奨
                                                </span>
                                            )}
                                            {/* Progress Badge Merged Here */}
                                            {(() => {
                                                const lessons = course.lessons || course.curriculums?.flatMap((c: any) => c.lessons) || [];
                                                const completed = lessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
                                                const progress = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;
                                                if (progress > 0) {
                                                    return (
                                                        <div className="flex flex-col items-end mt-1">
                                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-lg">
                                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                                <span className="text-[10px] font-black">{progress}% Complete</span>
                                                            </div>
                                                            {/* Progress Bar within container if needed, or simplified code */}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                    <div className="flex-1 p-3 md:p-8 flex flex-col justify-between relative min-w-0">

                                        <div>
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${course.level === '初級' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-blue-50 text-blue-600 border border-blue-100'
                                                    }`}>
                                                    {course.level}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {course.totalDuration || '0分'}
                                                </span>
                                            </div>
                                            {/* Title Area */}
                                            <h3 className="text-sm md:text-2xl font-black text-slate-800 leading-tight mb-1.5 md:mb-3 group-hover:text-blue-600 transition-colors break-words line-clamp-2 md:line-clamp-none">
                                                {course.title}
                                            </h3>
                                            <p className="text-xs md:text-sm text-slate-500 font-medium line-clamp-2 mb-6">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                            <div className="flex items-center gap-3">
                                                {course.instructor ? (
                                                    <>
                                                        <img src={course.instructor.image} className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover" alt="" />
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 leading-none">{course.instructor.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{course.instructor.role}</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 rounded-full border-2 border-white shadow-md bg-slate-100 flex items-center justify-center overflow-hidden">
                                                            <img src="/eis_logo_mark.png" className="w-8 h-8 object-contain" alt="" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 leading-none">Ehime Base</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Official Course</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
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
