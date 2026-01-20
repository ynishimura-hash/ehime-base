"use client";

import React, { useState, Suspense } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Building2, Briefcase, GraduationCap,
    Search, Edit3, Trash2, Eye,
    Plus, ChevronLeft, Upload, Video, FileVideo
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
    const supabase = createClient();

    React.useEffect(() => {
        if (currentTab === 'media') {
            fetchMedia();
        }
    }, [currentTab]);

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

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    obj[cleanHeader] = cleanValue;
                });
                return obj;
            });

            try {
                await addCourses(data);
                toast.success(`${data.length}件のコースを登録しました`);
            } catch (error) {
                toast.error('登録に失敗しました');
            }
        };
        reader.readAsText(file);
    };

    if (activeRole !== 'admin') {
        return <div className="p-10 text-center font-black">Authentication Required</div>;
    }

    const renderCompanies = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">企業管理一覧</h2>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all">
                    <Plus size={18} /> 新規企業登録
                </button>
            </div>
            <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="企業名または業界で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                />
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">企業名</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">業界</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ステータス</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">アクション</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {companies
                            .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(company => (
                                <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={company.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
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
                                                onClick={() => toast.info(`${company.name}の情報を編集します（モック）`)}
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
                    <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">一括公開停止</button>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all">
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
                    className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                />
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">求人タイトル</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">タイプ</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">企業</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {jobs
                            .filter(j =>
                                j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                companies.find(c => c.id === j.companyId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(job => (
                                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-black text-slate-800">{job.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${job.type === 'quest' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {job.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{companies.find(c => c.id === job.companyId)?.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button className="p-2 hover:text-blue-600"><Eye size={18} /></button>
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
                        onChange={handleCsvUpload}
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

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-sm mb-8 transition-colors group">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboardに戻る
                </Link>

                <main className="space-y-10">
                    <div className="flex gap-1 bg-slate-200 p-1.5 rounded-[2rem] self-start inline-flex">
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

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {currentTab === 'companies' && renderCompanies()}
                        {currentTab === 'jobs' && renderJobs()}
                        {currentTab === 'learning' && renderLearning()}
                        {currentTab === 'media' && renderMedia()}
                    </div>
                </main>
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
