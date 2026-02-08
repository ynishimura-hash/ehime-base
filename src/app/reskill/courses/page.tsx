"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    BookOpen, Search, Filter, Clock, ChevronRight,
    ChevronLeft, ArrowRight, GraduationCap,
    Lightbulb, Layout as LayoutIcon, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';

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

// Helper to sum durations
const getTotalDuration = (course: any) => {
    // If it has direct lessons (unlikely for tracks but possible for simple courses)
    let lessons = course.lessons || [];

    // If it has curriculums (Track/Course structure), aggregate lessons
    if (course.curriculums) {
        course.curriculums.forEach((curr: any) => {
            if (curr.lessons) {
                lessons = [...lessons, ...curr.lessons];
            }
        });
    }

    if (lessons.length === 0) return course.duration || '0:00';

    let totalSeconds = 0;
    lessons.forEach((l: any) => {
        if (!l.duration) return;
        const parts = l.duration.split(':').map(Number);
        if (parts.length === 2) {
            totalSeconds += parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
    });

    if (totalSeconds === 0) return course.duration || '0:00';

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    // const s = totalSeconds % 60; // Usually specific down to seconds isn't needed for total course duration

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export default function CoursesListPage() {
    const { completedLessonIds } = useAppStore();
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('すべて');
    const [sortBy, setSortBy] = useState<'newest' | 'title' | 'duration'>('newest');
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await fetch('/api/elearning/modules');
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data);
                }
            } catch (error) {
                console.error('Failed to fetch modules:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModules();
    }, []);

    // 日本語形式の再生時間を分に変換（例: "1時間3分" → 63, "58分" → 58）
    const parseDurationToMinutes = (duration: string): number => {
        if (!duration) return 0;
        let totalMinutes = 0;
        const hourMatch = duration.match(/(\d+)時間/);
        const minMatch = duration.match(/(\d+)分/);
        if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
        if (minMatch) totalMinutes += parseInt(minMatch[1]);
        return totalMinutes;
    };

    // コースタイトルから動的にカテゴリを推測
    const getCategoryFromTitle = (title: string): string => {
        if (title.includes('AI') || title.includes('活用')) return 'AI・自動化';
        if (title.includes('マーケティング') || title.includes('SNS')) return 'マーケティング';
        if (title.includes('デジタル')) return 'デジタル基礎';
        if (title.includes('Google') || title.includes('GAS') || title.includes('Apps Script')) return 'Google';
        if (title.includes('セキュリティ')) return 'セキュリティ';
        if (title.includes('アプリ') || title.includes('HP') || title.includes('制作')) return '制作・開発';
        if (title.includes('動画')) return 'クリエイティブ';
        if (title.includes('自動化') || title.includes('業務')) return 'AI・自動化';
        if (title.includes('キャリア')) return 'キャリア';
        if (title.includes('ITパスポート') || title.includes('資格')) return '資格取得';
        if (title.includes('アーカイブ') || title.includes('リスキル')) return 'アーカイブ';
        return 'その他';
    };

    // コースにカテゴリを付与
    const coursesWithCategory = courses.map(course => ({
        ...course,
        derivedCategory: course.category || getCategoryFromTitle(course.title)
    }));

    const categories = ['すべて', ...Array.from(new Set(coursesWithCategory.map(c => c.derivedCategory).filter((c): c is string => !!c)))];

    const filteredCourses = coursesWithCategory
        .filter((course: any) => {
            const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'すべて' || course.derivedCategory === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a: any, b: any) => {
            switch (sortBy) {
                case 'newest':
                    // viewCountが多い順（人気順として代用）
                    return (b.viewCount || 0) - (a.viewCount || 0);
                case 'title':
                    return (a.title || '').localeCompare(b.title || '', 'ja');
                case 'duration':
                    // 再生時間順（短い順）- totalDurationを使用
                    const durationA = parseDurationToMinutes(a.totalDuration || '');
                    const durationB = parseDurationToMinutes(b.totalDuration || '');
                    return durationA - durationB;
                default:
                    return 0;
            }
        });

    const getProgress = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return 0;
        const allLessons = course.lessons || course.curriculums?.flatMap((curr: any) => curr.lessons) || [];
        if (allLessons.length === 0) return 0;
        const completed = allLessons.filter((l: any) => completedLessonIds.includes(l.id)).length;
        return Math.round((completed / allLessons.length) * 100);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 overflow-x-hidden w-full max-w-full">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 flex flex-col items-center text-center">
                    <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100 flex items-center gap-2">
                        <GraduationCap size={14} /> Reskill University
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                        愛媛で、一生モノの<br /><span className="text-blue-600">スキルを磨こう。</span>
                    </h1>
                    <p className="max-w-2xl text-slate-500 font-bold text-sm md:text-base leading-relaxed">
                        地域DX、ITエンジニアリング、ビジネスマナーまで。<br className="hidden md:block" />
                        地元の企業の「今」必要としているスキルを体系的に学びます。
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-2">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="コース名やキーワードで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-transparent border-none rounded-2xl font-bold text-slate-700 placeholder:text-slate-400 focus:ring-0 transition-all outline-none"
                        />
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    {/* Categories and Sort */}
                    <div className="flex items-center justify-between gap-4 px-2 pb-2">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide min-w-0 flex-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${selectedCategory === cat
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <ArrowUpDown size={14} className="text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'newest' | 'title' | 'duration')}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                            >
                                <option value="newest">人気順</option>
                                <option value="title">タイトル順</option>
                                <option value="duration">再生時間順</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course: any) => {
                        const progress = getProgress(course.id);
                        // APIから直接totalDurationを使用
                        const durationDisplay = course.totalDuration || '0分';
                        return (
                            <Link
                                key={course.id}
                                href={`/reskill/course/${course.id}`}
                                className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all h-full flex flex-col"
                            >
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={getCourseImage(course)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={course.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                                            {course.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-white text-[10px] font-black">
                                            <Clock size={14} /> {durationDisplay}
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
                                            {course.instructor ? (
                                                <>
                                                    <img src={course.instructor.image} className="w-8 h-8 rounded-full border-2 border-white shadow-md shadow-slate-200 object-cover" alt="" />
                                                    <span className="text-xs font-black text-slate-700">{course.instructor.name}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-md bg-slate-100 flex items-center justify-center">
                                                        <img src="/icons/logo.png" className="w-5 h-5 opacity-50" onError={(e) => (e.currentTarget.src = '')} alt="" />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-700">Official Course</span>
                                                </>
                                            )}
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

