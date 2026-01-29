'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Folder, BookOpen, MoreVertical, Layout } from 'lucide-react';
import AdminSortableList from '@/components/admin/common/AdminSortableList';
import { ElearningService } from '@/services/elearning';

export default function AdminElearningPage() {
    const [tracks, setTracks] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);

            try {
                // 並列でフェッチ
                const [tracksResult, modulesResult] = await Promise.allSettled([
                    ElearningService.getTracks(),
                    ElearningService.getAllModules()
                ]);

                if (!isMounted) return;

                // Tracks の結果処理
                if (tracksResult.status === 'fulfilled') {
                    setTracks(tracksResult.value);
                } else {
                    console.error('Failed to load tracks:', tracksResult.reason);
                }

                // Modules の結果処理
                if (modulesResult.status === 'fulfilled') {
                    setModules(modulesResult.value);
                } else {
                    console.error('Failed to load modules:', modulesResult.reason);
                    setModules([]); // 失敗しても空配列で続行
                }
            } catch (e: any) {
                console.error('Unexpected error loading data:', e);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    if (isLoading) return <div className="p-10 text-slate-500 font-bold animate-pulse">Loading E-learning Data...</div>;
    if (error) return (
        <div className="p-10 text-red-500 font-bold bg-red-50 rounded-xl m-10 border border-red-200">
            Error loading data: {error}
            <button onClick={() => window.location.reload()} className="ml-4 underline">Retry</button>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">E-Learning Management</h1>
                <p className="text-slate-500 font-bold mt-2">
                    カリキュラムとコースの管理を行います。<br />
                    上位概念である「カリキュラム」を作成し、その中に「コース」を割り当てることができます。
                </p>
                <div className="mt-6">
                    <Link
                        href="/admin/elearning/content"
                        className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        <Folder size={20} />
                        <span>Manage Content Library</span>
                        <span className="bg-slate-700 text-xs px-2 py-0.5 rounded ml-2">Master</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* 1. Curriculums (Tracks) Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Layout className="text-blue-600" />
                            Curriculums (Tracks)
                        </h2>
                        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            <Plus size={16} /> 新規作成
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 font-bold mb-4">ドラッグして表示順を変更できます</p>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
                        <AdminSortableList
                            items={tracks}
                            keyExtractor={(item) => item.id}
                            onReorder={setTracks}
                            renderItem={(track) => (
                                <Link
                                    href={`/admin/elearning/curriculums/${track.id}`}
                                    className="flex items-center justify-between w-full p-3 hover:bg-slate-50 transition-colors rounded-xl group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                            <Layout size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{track.title}</h3>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {track.courses?.map((c: any) => (
                                                    <span key={c.id} className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                                                        {c.title}
                                                    </span>
                                                ))}
                                                {(!track.courses || track.courses.length === 0) && (
                                                    <span className="text-[10px] text-slate-300">No courses</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 text-slate-300 hover:text-slate-600">
                                        <MoreVertical size={20} />
                                    </div>
                                </Link>
                            )}
                        />
                        {tracks.length === 0 && (
                            <div className="p-10 text-center text-slate-400 text-sm font-bold">
                                No tracks yet.
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Courses (Modules) Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <BookOpen className="text-emerald-600" />
                            All Modules
                        </h2>
                        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors">
                            <Plus size={16} /> コース追加
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 font-bold mb-4">ドラッグして表示順を変更できます</p>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-2">
                        <AdminSortableList
                            items={modules}
                            keyExtractor={(item) => item.id}
                            onReorder={setModules}
                            renderItem={(mod) => (
                                <Link
                                    href={`/admin/elearning/courses/${mod.id}`}
                                    className="flex items-center justify-between w-full p-3 hover:bg-slate-50 transition-colors rounded-xl group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* カバー画像サムネイルまたはデフォルトアイコン */}
                                        {mod.image || mod.thumbnail_url ? (
                                            <img
                                                src={mod.image || mod.thumbnail_url}
                                                alt={mod.title}
                                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                                <BookOpen size={20} />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{mod.title}</h3>
                                            <p className="text-xs text-slate-400 font-bold mt-0.5">
                                                {mod.courseCount} Lessons
                                                <span className="mx-1.5">•</span>
                                                {mod.totalDuration || '0分'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2 text-slate-300 hover:text-slate-600">
                                        <MoreVertical size={20} />
                                    </div>
                                </Link>
                            )}
                        />
                        {modules.length === 0 && (
                            <div className="p-10 text-center text-slate-400 text-sm font-bold">
                                No modules yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
