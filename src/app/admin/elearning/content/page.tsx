'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, Filter, MoreVertical, Play, FileText, Trash2, Edit, LayoutGrid, List, X, Maximize2, Save, Upload, AlertTriangle, FileSpreadsheet, Wand2, CheckCircle2, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem, QuizData } from '@/data/mock_elearning_data';

import { getYoutubeId } from '@/utils/youtube';
import ContentFormModal from '@/components/admin/elearning/ContentFormModal';
import VideoPlayerModal from '@/components/admin/elearning/VideoPlayerModal';

// --- Modals ---

// Video Player Modal
// VideoPlayerModal imported from components

// ContentFormModal imported from components

// Delete Confirmation Modal
function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    itemTitle
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemTitle: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mb-2">削除してもよろしいですか？</h2>
                    <p className="text-sm text-slate-500 font-bold mb-6">
                        「{itemTitle}」<br />を本当に削除しますか？この操作は取り消せません。
                    </p>
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                            キャンセル
                        </button>
                        <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                            削除する
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// CSV Import Modal
function CSVImportModal({ isOpen, onClose, onImport }: { isOpen: boolean; onClose: () => void; onImport: (items: ContentItem[]) => void }) {
    const [csvText, setCsvText] = useState('');

    if (!isOpen) return null;

    const parseAndImport = () => {
        if (!csvText.trim()) return;

        const lines = csvText.trim().split('\n');
        const parsedItems: ContentItem[] = [];

        lines.forEach((line) => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                const title = parts[0].trim();
                const url = parts[1].trim();
                const category = parts[2] ? parts[2].trim() : '未分類';

                if (title && url) {
                    parsedItems.push({
                        id: Math.random().toString(36).substr(2, 9),
                        title,
                        url,
                        category,
                        type: 'video',
                        duration: '10:00',
                        createdAt: new Date().toISOString()
                    });
                }
            }
        });

        if (parsedItems.length > 0) {
            onImport(parsedItems);
            onClose();
            setCsvText('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                    <FileSpreadsheet className="text-green-600" />
                    CSV一括登録
                </h2>
                <p className="text-slate-500 text-xs font-bold mb-6">
                    以下の形式でデータを貼り付けてください：<br />
                    <code>タイトル, 動画URL, カテゴリ</code> (1行に1つ)
                </p>

                <textarea
                    className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm outline-none focus:border-blue-500 mb-4"
                    placeholder={`React入門, https://youtu.be/..., プログラミング\nデザイン基礎, https://youtu.be/..., デザイン`}
                    value={csvText}
                    onChange={e => setCsvText(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        キャンセル
                    </button>
                    <button onClick={parseAndImport} className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                        インポート実行
                    </button>
                </div>
            </div>
        </div>
    );
}

// Bulk Generate Modal
function BulkGenerateModal({
    isOpen,
    onClose,
    contents,
    onGenerateItem,
    onComplete
}: {
    isOpen: boolean;
    onClose: () => void;
    contents: ContentItem[];
    onGenerateItem: (item: ContentItem) => Promise<boolean>;
    onComplete: () => void;
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });

    // Filter items without quiz
    const targetItems = contents.filter(c => !c.quiz);

    if (!isOpen) return null;

    const handleStart = async () => {
        setIsProcessing(true);
        const total = targetItems.length;
        let success = 0;
        let fail = 0;

        setProgress({ current: 0, total, success: 0, fail: 0 });

        for (let i = 0; i < total; i++) {
            const item = targetItems[i];
            try {
                const result = await onGenerateItem(item);
                if (result) success++;
                else fail++;
            } catch (e) {
                fail++;
            }
            setProgress({ current: i + 1, total, success, fail });
        }

        setIsProcessing(false);
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={isProcessing ? undefined : onClose}>
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Wand2 size={24} className={isProcessing ? "animate-spin" : ""} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">小テスト一括生成</h2>

                    {!isProcessing && progress.total === 0 && (
                        <>
                            <p className="text-sm text-slate-500 font-bold mb-6">
                                現在表示されているコンテンツのうち、<br />
                                <span className="text-purple-600 text-lg">{targetItems.length}</span> 件のコンテンツに小テストがありません。
                            </p>
                            <p className="text-xs text-slate-400 mb-6">
                                ※ AIがタイトルから問題を自動生成します。<br />
                                ※ 生成には時間がかかる場合があります。
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleStart}
                                    disabled={targetItems.length === 0}
                                    className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    生成を開始する
                                </button>
                            </div>
                        </>
                    )}

                    {(isProcessing || progress.total > 0) && (
                        <div className="w-full space-y-4">
                            <p className="text-sm font-bold text-slate-600">
                                {isProcessing ? '生成中...' : '生成完了'} ({progress.current} / {progress.total})
                            </p>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-purple-600 h-full transition-all duration-300"
                                    style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 px-2">
                                <span className="text-green-600">成功: {progress.success}</span>
                                <span className="text-red-500">失敗: {progress.fail}</span>
                            </div>
                            {!isProcessing && (
                                <button onClick={onClose} className="w-full mt-4 bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                                    閉じる
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


// --- Main Page Component ---

import { ElearningService } from '@/services/elearning';

export default function AdminContentPage() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 50;

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // UI States
    const [playingVideo, setPlayingVideo] = useState<ContentItem | null>(null);
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

    // Modal States
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCSVOpen, setIsCSVOpen] = useState(false);
    const [isBulkGenOpen, setIsBulkGenOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<ContentItem | null>(null);

    const [modules, setModules] = useState<{ id: string; title: string }[]>([]);

    // Fetch Data
    const loadContents = async () => {
        setIsLoading(true);
        try {
            // Load modules for filter if not loaded
            if (modules.length === 0) {
                const mods = await ElearningService.getAllModules();
                setModules(mods.map(m => ({ id: m.id, title: m.title })));
            }

            const { data, count } = await ElearningService.getAllContent(page, ITEMS_PER_PAGE, filterCategory === 'All' ? undefined : filterCategory);
            setContents(data);
            setTotalItems(count);
            setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        } catch (error) {
            console.error('Failed to fetch contents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset page on filter change
        loadContents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory]);

    useEffect(() => {
        loadContents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]); // Reload on page change

    // Filter Logic - Server Side mainly, but UI state needs to hold it
    // Note: We use useEffect to reload when filter changes now

    // --- Handlers ---

    const handleSave = async (item: ContentItem) => {
        try {
            if (editingItem) {
                // Update
                await ElearningService.updateContent(item.id, item);
            } else {
                // Create
                await ElearningService.createContent(item, item.category);
            }
            await loadContents(); // Reload
            setIsFormOpen(false);
        } catch (e) {
            console.error(e);
            alert('保存に失敗しました。カテゴリが存在するか確認してください。');
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        try {
            await ElearningService.deleteContent(deletingItem.id);
            await loadContents(); // Reload
            setDeletingItem(null);
        } catch (e) {
            console.error(e);
            alert('削除に失敗しました');
        }
    };

    const handleImport = async (newItems: ContentItem[]) => {
        alert('CSVインポートは現在データベースに直接反映されません。個別に登録してください。');
        setIsCSVOpen(false);
    };

    // Single item generation handler for Bulk Modal
    const handleGenerateItem = async (item: ContentItem): Promise<boolean> => {
        try {
            const res = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: item.title })
            });

            if (!res.ok) return false;

            const quizData = await res.json();
            await ElearningService.updateContent(item.id, { quiz: quizData });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };







    const openCreate = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const openEdit = (item: ContentItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const openDelete = (item: ContentItem) => {
        setDeletingItem(item);
    };


    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        コンテンツライブラリ
                        <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                            {totalItems} items total
                        </span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-2">
                        eラーニングの動画コンテンツを管理します。
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsBulkGenOpen(true)}
                        className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-600 px-4 py-2.5 rounded-xl font-bold hover:bg-purple-100 transition-colors"
                    >
                        <Wand2 size={18} />
                        <span className="hidden md:inline">小テスト一括生成</span>
                    </button>
                    <button
                        onClick={() => setIsCSVOpen(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        <FileSpreadsheet size={18} className="text-green-600" />
                        <span className="hidden md:inline">CSV一括登録</span>
                    </button>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        <Plus size={20} />
                        <span>新規作成</span>
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">

                {/* Search & Filter */}
                <div className="flex-1 w-full flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="コンテンツを検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 font-bold text-slate-700 bg-slate-50 rounded-lg border-2 border-transparent focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                        <Filter size={20} className="text-slate-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="font-bold text-slate-600 bg-transparent outline-none cursor-pointer max-w-[200px]"
                        >
                            <option value="All">すべてのコース</option>
                            <option value="unassigned">コース未割り当て</option>
                            <hr />
                            {modules.map(mod => (
                                <option key={mod.id} value={mod.id}>{mod.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>


            {/* Content List - Conditional Render */}
            {viewMode === 'grid' ? (
                // --- GRID VIEW ---
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.map(item => {
                        const youtubeId = getYoutubeId(item.url);
                        const thumbnail = item.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

                        return (
                            <div key={item.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                                {/* Proportional Video Area */}
                                <div className="aspect-video bg-slate-900 relative">
                                    <>
                                        {activeVideoId === item.id && youtubeId ? (
                                            <div className="w-full h-full relative" onClick={() => setActiveVideoId(null)}>
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&modestbranding=1`}
                                                    className="w-full h-full pointer-events-none"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen={false}
                                                />
                                                {/* Overlay to capture click for stop */}
                                                <div className="absolute inset-0 z-10" />
                                            </div>
                                        ) : (
                                            <>
                                                {thumbnail ? (
                                                    <img src={thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                        <FileText size={48} />
                                                    </div>
                                                )}

                                                {/* Center Play Button - Inline */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                    <button
                                                        onClick={() => setActiveVideoId(item.id)}
                                                        className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform cursor-pointer hover:bg-white"
                                                    >
                                                        <Play size={20} className="text-slate-900 ml-1" />
                                                    </button>
                                                </div>

                                                {/* Top Right Maximize Button - Modal */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPlayingVideo(item);
                                                        }}
                                                        className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-md transition-colors"
                                                        title="拡大して再生"
                                                    >
                                                        <Maximize2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {/* Indicators: Quiz & Material */}
                                        <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1 items-start">
                                            {item.quiz && (
                                                <span className="px-2 py-1 rounded text-[10px] font-black uppercase text-white shadow-sm bg-purple-500 flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Quiz
                                                </span>
                                            )}
                                            {item.material_url && (
                                                <span className="px-2 py-1 rounded text-[10px] font-black uppercase text-white shadow-sm bg-blue-500 flex items-center gap-1">
                                                    <LinkIcon size={10} /> Doc
                                                </span>
                                            )}
                                        </div>

                                        {/* Duration Label */}
                                        {item.duration && (
                                            <div className="absolute bottom-2 right-2 pointer-events-none">
                                                <span className="px-2 py-1 rounded text-[10px] font-black bg-black/60 text-white backdrop-blur-md">
                                                    {item.duration}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{item.category}</span>
                                        <button className="text-slate-300 hover:text-slate-600">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                    <h3 className="font-bold text-slate-800 leading-snug mb-4 line-clamp-2 min-h-[3rem]">
                                        {item.title}
                                    </h3>

                                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-slate-400 text-xs font-bold">
                                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(item)} className="hover:text-blue-600 p-1"><Edit size={16} /></button>
                                            <button onClick={() => openDelete(item)} className="hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // --- LIST VIEW ---
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-black text-slate-700 text-xs uppercase tracking-wider">タイトル</th>
                                <th className="px-6 py-4 font-black text-slate-700 text-xs uppercase tracking-wider">カテゴリ (コース)</th>
                                <th className="px-6 py-4 font-black text-slate-700 text-xs uppercase tracking-wider w-[100px]">オプション</th>
                                <th className="px-6 py-4 font-black text-slate-700 text-xs uppercase tracking-wider w-[100px]">時間</th>
                                <th className="px-6 py-4 font-black text-slate-700 text-xs uppercase tracking-wider w-[150px]">追加日</th>
                                <th className="px-6 py-4 font-black text-slate-700 text-xs uppercase tracking-wider w-[100px] text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contents.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Preview Thumb on Hover (Click to Maximize as well) */}
                                            <button
                                                onClick={() => setPlayingVideo(item)}
                                                className="w-12 h-8 bg-slate-200 rounded overflow-hidden relative shrink-0 group-hover:ring-2 ring-blue-400 transition-all"
                                            >
                                                {item.url && (
                                                    <img
                                                        src={`https://img.youtube.com/vi/${getYoutubeId(item.url)}/mqdefault.jpg`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100">
                                                    <Play size={12} className="text-white" fill="currentColor" />
                                                </div>
                                            </button>
                                            <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setPlayingVideo(item)}>
                                                {item.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md whitespace-nowrap">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {item.quiz && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100">
                                                    <CheckCircle2 size={10} /> Quiz
                                                </span>
                                            )}
                                            {item.material_url && (
                                                <a href={item.material_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100" onClick={e => e.stopPropagation()}>
                                                    <LinkIcon size={10} /> Doc
                                                </a>
                                            )}
                                            {!item.quiz && !item.material_url && (
                                                <span className="text-slate-300 text-xs font-bold">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-500">
                                            {item.duration || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-slate-400">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-300">
                                            <button onClick={() => openEdit(item)} className="hover:text-blue-600 p-1"><Edit size={16} /></button>
                                            <button onClick={() => openDelete(item)} className="hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {
                totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-slate-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-50 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )
            }

            {/* Video Modal */}
            <VideoPlayerModal content={playingVideo} onClose={() => setPlayingVideo(null)} />

            {/* Create/Edit Modal */}
            <ContentFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                initialData={editingItem}
            />

            <BulkGenerateModal
                isOpen={isBulkGenOpen}
                onClose={() => setIsBulkGenOpen(false)}
                contents={contents} // Pass currently filtered/viewed contents
                onGenerateItem={handleGenerateItem}
                onComplete={() => loadContents()}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={!!deletingItem}
                onClose={() => setDeletingItem(null)}
                onConfirm={handleDelete}
                itemTitle={deletingItem?.title || ''}
            />

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={isCSVOpen}
                onClose={() => setIsCSVOpen(false)}
                onImport={handleImport}
            />
        </div >
    );
}

