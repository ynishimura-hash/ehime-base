"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, MoreVertical, Layout, Search, Filter } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { Course } from '@/types/shared';

const CourseCard = ({ course }: { course: Course }) => {
    const [imgError, setImgError] = useState(false);
    const hasImage = (course.thumbnail_url || course.image) && !imgError;

    return (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex gap-4">
                <div className="shrink-0">
                    {hasImage ? (
                        <img
                            src={course.thumbnail_url || course.image}
                            alt={course.title}
                            className="w-20 h-20 rounded-2xl object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <BookOpen size={32} />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-black text-slate-800 text-lg truncate group-hover:text-emerald-600 transition-colors">
                                {course.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-slate-400">
                                    {course.lessons?.length || 0} Lessons
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="text-xs font-bold text-slate-400">
                                    {course.level || '初級'}
                                </span>
                            </div>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {course.category || '一般'}
                </span>
                {course.isFeatured && (
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        Featured
                    </span>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                    href={`/dashboard/company/courses/${course.id}`}
                    className="flex items-center justify-center py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors"
                >
                    詳細・編集
                </Link>
                <Link
                    href={`/reskill/course/${course.id}`}
                    target="_blank"
                    className="flex items-center justify-center py-2.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-sm hover:bg-emerald-100 transition-colors"
                >
                    プレビュー
                </Link>
            </div>
        </div>
    );
};

export default function CompanyCoursesPage() {
    const { courses, currentCompanyId, activeRole, currentUserId } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter courses created by this company/instructor
    // Note: In a real scenario, we would filter by 'created_by' in DB.
    // For now, we simulate this by showing all for c_eis or filtering if field exists.
    const myCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        // Temporary logic: Show all if company is c_eis (demo), or filter by owner if data available
        // In the next step, we will add 'owner_id' to Course type
        return matchesSearch;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">講座管理</h1>
                    <p className="text-slate-500 font-bold mt-2">
                        {activeRole === 'instructor' ? 'あなたが作成した講座' : '自社で作成した学習コンテンツ'}の管理・編集ができます。
                    </p>
                </div>
                <Link
                    href="/dashboard/company/courses/new"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-3xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:-translate-y-1"
                >
                    <Plus size={20} />
                    <span>新規講座を作成</span>
                </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">公開中の講座</p>
                    <p className="text-3xl font-black text-slate-800">{myCourses.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">総受講者数</p>
                    <p className="text-3xl font-black text-slate-800">128</p>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">平均満足度</p>
                    <p className="text-3xl font-black text-slate-800">4.8 <span className="text-sm text-slate-400">/ 5.0</span></p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="講座タイトルで検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 shadow-sm transition-all"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-3xl font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                    <Filter size={20} />
                    フィルター
                </button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
                {myCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={40} />
                        </div>
                        <p className="text-slate-400 font-bold">まだ講座がありません。新しい学びの扉を開きましょう！</p>
                        <Link
                            href="/dashboard/company/courses/new"
                            className="inline-block mt-6 text-emerald-600 font-black hover:underline"
                        >
                            最初の講座を作成する
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
