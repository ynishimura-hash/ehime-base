"use client";

import React, { useState, Suspense } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Building2, Briefcase, GraduationCap, Users,
    Search, Edit3, Trash2, Eye, X, CheckSquare, Square,
    Plus, ChevronLeft, Upload, Video, FileVideo, Save
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

function AdminManagementContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'companies';
    const { companies, jobs, activeRole, courses, fetchCourses, addCourses } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoInputRef = React.useRef<HTMLInputElement>(null);
    const [mediaItems, setMediaItems] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    // New State for Users and Editing/Bulk
    // New State for Real Data
    const [realUsers, setRealUsers] = useState<any[]>([]);
    const [realCompanies, setRealCompanies] = useState<any[]>([]);
    const [realJobs, setRealJobs] = useState<any[]>([]);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [editMode, setEditMode] = useState<'user' | 'company' | 'job' | null>(null);
    const [actionType, setActionType] = useState<'create' | 'edit'>('edit');

    const usersFileInputRef = React.useRef<HTMLInputElement>(null);
    const companiesFileInputRef = React.useRef<HTMLInputElement>(null);
    const jobsFileInputRef = React.useRef<HTMLInputElement>(null);

    const supabase = createClient();

    React.useEffect(() => {
        setSelectedIds(new Set()); // Clear selection on tab change
        if (currentTab === 'media') {
            fetchMedia();
        } else if (currentTab === 'users') {
            fetchUsers();
        } else if (currentTab === 'companies') {
            fetchCompanies();
        } else if (currentTab === 'jobs') {
            fetchJobs();
        }
    }, [currentTab]);

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) setRealUsers(data);
    };

    const fetchCompanies = async () => {
        const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
        if (!error && data) setRealCompanies(data);
    };

    const fetchJobs = async () => {
        const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        if (!error && data) setRealJobs(data);
    };

    const fetchMedia = async () => {
        const { data, error } = await supabase
            .from('media_library')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching media:', error);
            toast.error('メディア情報の取得に失敗しました');
        } else {
            setMediaItems(data || []);
        }
    };

    const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('videos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('videos')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const { error: dbError } = await supabase
                .from('media_library')
                .insert({
                    filename: file.name,
                    storage_path: filePath,
                    public_url: publicUrl,
                    // uploaded_by: user.id // Supabase Auth user ID would go here
                });

            if (dbError) throw dbError;

            toast.success('動画をアップロードしました');
            fetchMedia();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('アップロードに失敗しました');
        } finally {
            setUploading(false);
        }
    };

    React.useEffect(() => {
        if (courses.length === 0) {
            fetchCourses();
        }
    }, [courses.length, fetchCourses]);

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'user' | 'company' | 'job' | 'course') => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',');

            const data = rows.slice(1).map(row => {
                const values = row.split(',');
                const obj: any = {};
                headers.forEach((header, i) => {
                    const cleanHeader = header.trim().replace(/"/g, '');
                    const cleanValue = values[i]?.trim().replace(/"/g, '');
                    if (cleanHeader) obj[cleanHeader] = cleanValue;
                });
                return obj;
            });

            try {
                let error = null;
                if (type === 'user') {
                    // Warning: Ideally requires Auth API, inserting to profile might fail if ID not provided
                    // For now, we attempt direct insert if schema allows or use random ID if possible (depends on DB)
                    // We will just try insertion.
                    const { error: err } = await supabase.from('profiles').insert(data);
                    error = err;
                    if (!error) fetchUsers();
                } else if (type === 'company') {
                    const { error: err } = await supabase.from('companies').insert(data);
                    error = err;
                    if (!error) fetchCompanies();
                } else if (type === 'job') {
                    const { error: err } = await supabase.from('jobs').insert(data);
                    error = err;
                    if (!error) fetchJobs();
                } else if (type === 'course') {
                    await addCourses(data); // Existing logic
                }

                if (error) throw error;
                toast.success(`${data.length}件のデータを登録しました`);
            } catch (error) {
                console.error(error);
                toast.error('登録に失敗しました。CSVのフォーマットを確認してください。');
            }
        };
        reader.readAsText(file);
    };

    if (activeRole !== 'admin') {
        return <div className="p-10 text-center font-black">Authentication Required</div>;
    }

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = (ids: string[]) => {
        if (selectedIds.size === ids.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(ids));
        }
    };

    const handleBulkAction = async (action: 'delete' | 'verify') => {
        if (!confirm(`${selectedIds.size}件のアイテムに対して操作を実行しますか？`)) return;

        // Mock Implementation for now
        toast.info('一括操作を実行しました（バックエンド未接続）');
        setSelectedIds(new Set());
    };

    const renderBulkActions = () => (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 transition-all transform ${selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
            <span className="font-bold text-sm">{selectedIds.size} 選択中</span>
            <div className="h-4 w-px bg-white/20" />
            <button onClick={() => handleBulkAction('verify')} className="text-xs font-bold hover:text-blue-300 flex items-center gap-2">
                <CheckSquare size={16} /> 承認/認証
            </button>
            <button onClick={() => handleBulkAction('delete')} className="text-xs font-bold hover:text-red-300 flex items-center gap-2">
                <Trash2 size={16} /> 削除
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 hover:bg-white/20 rounded-full">
                <X size={16} />
            </button>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">求職者一覧</h2>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={usersFileInputRef}
                        onChange={(e) => handleCsvUpload(e, 'user')}
                    />
                    <button
                        onClick={() => usersFileInputRef.current?.click()}
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                        <Upload size={18} /> CSV登録
                    </button>
                    <button
                        onClick={() => { setEditingItem({}); setEditMode('user'); setActionType('create'); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all"
                    >
                        <Plus size={18} /> 新規追加
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <button onClick={() => toggleAll(realUsers.map(u => u.id))}>
                                    {selectedIds.size === realUsers.length && realUsers.length > 0 ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">ユーザー</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">タイプ</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">登録日</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">アクション</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {realUsers.map(user => (
                            <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(user.id) ? 'bg-blue-50/50' : ''}`}>
                                <td className="px-6 py-4">
                                    <button onClick={() => toggleSelection(user.id)}>
                                        {selectedIds.has(user.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatar_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" alt="" />
                                        <div>
                                            <div className="font-black text-slate-900">{user.full_name || 'No Name'}</div>
                                            <div className="text-xs text-slate-500 font-bold">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-black ${user.user_type === 'student' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.user_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => { setEditingItem(user); setEditMode('user'); setActionType('edit'); }}
                                        className="p-2 text-slate-400 hover:text-blue-600"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {renderBulkActions()}
        </div >
    );

    const renderCompanies = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">企業管理一覧</h2>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={companiesFileInputRef}
                        onChange={(e) => handleCsvUpload(e, 'company')}
                    />
                    <button
                        onClick={() => companiesFileInputRef.current?.click()}
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                        <Upload size={18} /> CSV登録
                    </button>
                    <button
                        onClick={() => { setEditingItem({}); setEditMode('company'); setActionType('create'); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all"
                    >
                        <Plus size={18} /> 新規企業登録
                    </button>
                </div>
            </div>
            <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="企業名または業界で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 text-sm placeholder:text-slate-400"
                />
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <button onClick={() => toggleAll(realCompanies.map(c => c.id))}>
                                    {selectedIds.size === realCompanies.length && realCompanies.length > 0 ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">企業名</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">業界</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ステータス</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">アクション</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {realCompanies
                            .filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(company => (
                                <tr key={company.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(company.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelection(company.id)}>
                                            {selectedIds.has(company.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={company.image_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                            <span className="font-black text-slate-800">{company.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{company.industry}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingItem(company); setEditMode('company'); setActionType('edit'); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => toast.error(`${company.name}を削除してよろしいですか？`)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderJobs = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">求人・クエスト管理</h2>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={jobsFileInputRef}
                        onChange={(e) => handleCsvUpload(e, 'job')}
                    />
                    <button
                        onClick={() => jobsFileInputRef.current?.click()}
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                        <Upload size={18} /> CSV登録
                    </button>
                    <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">一括公開停止</button>
                    <button
                        onClick={() => { setEditingItem({}); setEditMode('job'); setActionType('create'); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all"
                    >
                        <Plus size={18} /> 新規追加
                    </button>
                </div>
            </div>
            <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="求人タイトルまたは企業名で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 text-sm placeholder:text-slate-400"
                />
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <button onClick={() => toggleAll(realJobs.map(j => j.id))}>
                                    {selectedIds.size === realJobs.length && realJobs.length > 0 ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">求人タイトル</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">タイプ</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">企業</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {realJobs
                            .filter(j =>
                                (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                realCompanies.find(c => c.id === j.company_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(job => (
                                <tr key={job.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(job.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelection(job.id)}>
                                            {selectedIds.has(job.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-800">{job.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${job.type === 'quest' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {(job.type || 'job').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{realCompanies.find(c => c.id === job.company_id)?.name || job.company_id}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button
                                                onClick={() => { setEditingItem(job); setEditMode('job'); setActionType('edit'); }}
                                                className="p-2 hover:text-blue-600"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderLearning = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">eラーニング・コース管理</h2>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => handleCsvUpload(e, 'course')}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                    >
                        <Upload size={18} /> CSVから一括登録
                    </button>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all">
                        <Plus size={18} /> 新規追加
                    </button>
                </div>
            </div>
            <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="コース名またはカテゴリーで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses
                    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-4">
                            <img src={course.image} className="w-24 h-24 rounded-3xl object-cover" alt="" />
                            <div className="flex-1">
                                <h3 className="font-black text-slate-800 leading-tight">{course.title}</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">{course.category} | {course.level}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <button className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline">
                                        <Edit3 size={12} /> 編集
                                    </button>
                                    <button className="text-xs font-black text-slate-400 flex items-center gap-1 hover:underline">
                                        <Eye size={12} /> プレビュー
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );

    const renderMedia = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">メディア(動画)管理</h2>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                    />
                    <button
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Upload size={18} />}
                        動画をアップロード
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm p-6">
                {mediaItems.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-bold">
                        <FileVideo size={48} className="mx-auto mb-4 opacity-20" />
                        動画はまだアップロードされていません
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mediaItems.map((item) => (
                            <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                <video src={item.public_url} className="w-full aspect-video object-cover" controls />
                                <div className="p-4">
                                    <p className="font-black text-slate-800 text-sm truncate" title={item.filename}>
                                        {item.filename}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.public_url);
                                                toast.success('URLをコピーしました');
                                            }}
                                            className="text-xs font-black text-blue-600 hover:underline"
                                        >
                                            URLコピー
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('本当に削除しますか？')) return;
                                                const { error } = await supabase.from('media_library').delete().eq('id', item.id);
                                                if (error) {
                                                    toast.error('削除に失敗しました');
                                                } else {
                                                    toast.success('削除しました');
                                                    fetchMedia();
                                                }
                                            }}
                                            className="text-xs font-black text-red-400 hover:text-red-600"
                                        >
                                            削除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const handleSaveEdit = async () => {
        if (!editingItem || !editMode) return;

        try {
            if (editMode === 'user') {
                if (actionType === 'create') {
                    // Create logic
                    const { error } = await supabase.from('profiles').insert([editingItem]);
                    if (error) throw error;
                    toast.success('ユーザーを作成しました');
                    fetchUsers();
                } else {
                    // Update logic
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            full_name: editingItem.full_name,
                            user_type: editingItem.user_type
                        })
                        .eq('id', editingItem.id);
                    if (error) throw error;
                    toast.success('更新しました');
                    fetchUsers();
                }
            } else if (editMode === 'company') {
                if (actionType === 'create') {
                    const { error } = await supabase.from('companies').insert([editingItem]);
                    if (error) throw error;
                    toast.success('企業を作成しました');
                    fetchCompanies();
                } else {
                    const { error } = await supabase
                        .from('companies')
                        .update({
                            name: editingItem.name,
                            industry: editingItem.industry,
                            location: editingItem.location
                        })
                        .eq('id', editingItem.id);
                    if (error) throw error;
                    toast.success('更新しました');
                    fetchCompanies();
                }
            } else if (editMode === 'job') {
                if (actionType === 'create') {
                    const { error } = await supabase.from('jobs').insert([editingItem]);
                    if (error) throw error;
                    toast.success('求人を作成しました');
                    fetchJobs();
                } else {
                    const { error } = await supabase
                        .from('jobs')
                        .update({
                            title: editingItem.title,
                            type: editingItem.type,
                            description: editingItem.description
                        })
                        .eq('id', editingItem.id);
                    if (error) throw error;
                    toast.success('更新しました');
                    fetchJobs();
                }
            }
            setEditingItem(null);
        } catch (error) {
            console.error(error);
            toast.error('保存に失敗しました');
        }
    };

    const renderEditModal = () => (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">{actionType === 'create' ? '新規登録' : '詳細編集'}</h3>
                    <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {editMode === 'user' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">名前</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.full_name || editingItem.name || ''}
                                    onChange={e => setEditingItem({ ...editingItem, full_name: e.target.value, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ユーザータイプ</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.user_type || 'student'}
                                    onChange={e => setEditingItem({ ...editingItem, user_type: e.target.value })}
                                >
                                    <option value="student">Student (求職者)</option>
                                    <option value="company">Company (企業)</option>
                                    <option value="specialist">Specialist</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </>
                    )}
                    {editMode === 'company' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">企業名</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.name || ''}
                                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">業界</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.industry || ''}
                                    onChange={e => setEditingItem({ ...editingItem, industry: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">所在地</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.location || ''}
                                    onChange={e => setEditingItem({ ...editingItem, location: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                    {editMode === 'job' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">タイトル</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.title || ''}
                                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">タイプ</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.type || 'job'}
                                    onChange={e => setEditingItem({ ...editingItem, type: e.target.value })}
                                >
                                    <option value="job">求人 (Job)</option>
                                    <option value="quest">クエスト (Quest)</option>
                                </select>
                            </div>
                            {actionType === 'create' && (
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">企業ID (company_id)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        placeholder="企業IDを入力"
                                        value={editingItem.company_id || ''}
                                        onChange={e => setEditingItem({ ...editingItem, company_id: e.target.value })}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">説明 (簡易)</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[100px]"
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => setEditingItem(null)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">キャンセル</button>
                    <button onClick={handleSaveEdit} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                        <Save size={18} /> 保存する
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-sm mb-8 transition-colors group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboardに戻る
                </Link>

                <main className="space-y-10">
                    <div className="flex gap-1 bg-slate-200 p-1.5 rounded-[2rem] self-start inline-flex flex-wrap">
                        <button
                            onClick={() => router.push('?tab=users')}
                            className={`px-8 py-3.5 rounded-3xl text-sm font-black transition-all ${currentTab === 'users' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            <Users size={16} className="inline mr-2" /> 求職者
                        </button>
                        <button
                            onClick={() => router.push('?tab=companies')}
                            className={`px-8 py-3.5 rounded-3xl text-sm font-black transition-all ${currentTab === 'companies' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            <Building2 size={16} className="inline mr-2" /> 企業管理
                        </button>
                        <button
                            onClick={() => router.push('?tab=jobs')}
                            className={`px-8 py-3.5 rounded-3xl text-sm font-black transition-all ${currentTab === 'jobs' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            <Briefcase size={16} className="inline mr-2" /> 求人・クエスト
                        </button>
                        <button
                            onClick={() => router.push('?tab=learning')}
                            className={`px-8 py-3.5 rounded-3xl text-sm font-black transition-all ${currentTab === 'learning' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            <GraduationCap size={16} className="inline mr-2" /> Eラーニング
                        </button>
                        <button
                            onClick={() => router.push('?tab=media')}
                            className={`px-8 py-3.5 rounded-3xl text-sm font-black transition-all ${currentTab === 'media' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-white/50'}`}
                        >
                            <Video size={16} className="inline mr-2" /> 動画管理
                        </button>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                        {currentTab === 'users' && renderUsers()}
                        {currentTab === 'companies' && renderCompanies()}
                        {currentTab === 'jobs' && renderJobs()}
                        {currentTab === 'learning' && renderLearning()}
                        {currentTab === 'media' && renderMedia()}
                    </div>
                </main>

                {editingItem && renderEditModal()}
            </div>
        </div>
    );
}

export default function AdminManagementPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-black">Loading...</div>}>
            <AdminManagementContent />
        </Suspense>
    );
}
