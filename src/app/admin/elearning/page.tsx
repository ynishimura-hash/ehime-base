'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Folder, BookOpen, MoreVertical, Layout, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import AdminSortableList from '@/components/admin/common/AdminSortableList';
import { ElearningService } from '@/services/elearning';
import { toast } from 'sonner';

const TrackListItem = ({ track, onUpdate }: { track: any, onUpdate: () => void }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleTogglePublish = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsProcessing(true);
        try {
            await ElearningService.updateTrack(track.id, { is_published: !track.is_published });
            toast.success(track.is_published ? 'カリキュラムを非公開にしました' : 'カリキュラムを公開しました');
            onUpdate();
        } catch (error) {
            console.error('Update failed', error);
            toast.error('更新に失敗しました');
        } finally {
            setIsProcessing(false);
            setIsMenuOpen(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('このカリキュラムを削除してもよろしいですか？含まれるコースとの紐付けも解除されます。')) return;

        setIsProcessing(true);
        try {
            await ElearningService.deleteTrack(track.id);
            toast.success('カリキュラムを削除しました');
            onUpdate();
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('削除に失敗しました');
        } finally {
            setIsProcessing(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="relative group/item">
            <Link
                href={`/admin/elearning/curriculums/${track.id}`}
                className="flex items-center justify-between w-full p-3 hover:bg-slate-50 transition-colors rounded-xl group relative"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${track.is_published ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Layout size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold transition-colors ${track.is_published ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-500'}`}>
                                {track.title}
                            </h3>
                            {!track.is_published && (
                                <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <EyeOff size={10} /> 非公開
                                </span>
                            )}
                            {track.is_published && (
                                <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <Eye size={10} /> 公開中
                                </span>
                            )}
                        </div>
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
            </Link>

            {/* Action Menu Trigger */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-2 text-slate-300 hover:text-slate-600 bg-white/50 hover:bg-white rounded-lg transition-all"
                    >
                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
                    </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                }}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1">
                                <button
                                    onClick={handleTogglePublish}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                >
                                    {track.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {track.is_published ? '非公開にする' : '公開する'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                                >
                                    <Trash2 size={16} />
                                    削除する
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ModuleListItem = ({ mod, onUpdate }: { mod: any, onUpdate: () => void }) => {
    const [imgError, setImgError] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const hasImage = (mod.image || mod.thumbnail_url) && !imgError;

    const handleTogglePublish = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsProcessing(true);
        try {
            await ElearningService.updateModule(mod.id, { is_public: !mod.is_public });
            toast.success(mod.is_public ? 'コースを非公開にしました' : 'コースを公開しました');
            onUpdate();
        } catch (error) {
            console.error('Update failed', error);
            toast.error('更新に失敗しました');
        } finally {
            setIsProcessing(false);
            setIsMenuOpen(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('このコースを削除してもよろしいですか？含まれるレッスンも全て削除されます。')) return;

        setIsProcessing(true);
        try {
            await ElearningService.deleteModule(mod.id);
            toast.success('コースを削除しました');
            onUpdate();
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('削除に失敗しました');
        } finally {
            setIsProcessing(false);
            setIsMenuOpen(false);
        }
    };

    return (
        <div className="relative group/item">
            <Link
                href={`/admin/elearning/courses/${mod.id}`}
                className="flex items-center justify-between w-full p-3 hover:bg-slate-50 transition-colors rounded-xl group relative"
            >
                <div className="flex items-center gap-4">
                    {hasImage ? (
                        <img
                            src={mod.image || mod.thumbnail_url}
                            alt={mod.title}
                            className={`w-10 h-10 rounded-lg object-cover shrink-0 ${!mod.is_public ? 'opacity-50 grayscale' : ''}`}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${mod.is_public ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            <BookOpen size={20} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold transition-colors ${mod.is_public ? 'text-slate-800 group-hover:text-emerald-600' : 'text-slate-500'}`}>
                                {mod.title}
                            </h3>
                            {!mod.is_public && (
                                <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <EyeOff size={10} /> 非公開
                                </span>
                            )}
                            {mod.is_public && (
                                <span className="bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <Eye size={10} /> 公開中
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            {mod.category && mod.category !== '未分類' && (
                                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {mod.category}
                                </span>
                            )}
                            <span className="text-xs text-slate-400 font-bold">
                                {mod.courseCount} Lessons
                                <span className="mx-1.5">•</span>
                                {mod.totalDuration || '0分'}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Action Menu Trigger - Absolute positioned to be clickable without triggering Link */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="p-2 text-slate-300 hover:text-slate-600 bg-white/50 hover:bg-white rounded-lg transition-all"
                    >
                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
                    </button>

                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                }}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1">
                                <button
                                    onClick={handleTogglePublish}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                                >
                                    {mod.is_public ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {mod.is_public ? '非公開にする' : '公開する'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                                >
                                    <Trash2 size={16} />
                                    削除する
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function AdminElearningPage() {
    const [tracks, setTracks] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);

        try {
            // 並列でフェッチ
            const [tracksResult, modulesResult] = await Promise.allSettled([
                ElearningService.getTracks(true),
                ElearningService.getAllModules()
            ]);

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
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
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

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                        <AdminSortableList
                            items={tracks}
                            keyExtractor={(item) => item.id}
                            onReorder={setTracks}
                            renderItem={(track) => <TrackListItem track={track} onUpdate={loadData} />}
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

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2">
                        <AdminSortableList
                            items={modules}
                            keyExtractor={(item) => item.id}
                            onReorder={setModules}
                            renderItem={(mod) => <ModuleListItem mod={mod} onUpdate={loadData} />}
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
