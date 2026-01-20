"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit3, Trash2, Eye, MapPin, Briefcase, Clock } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';

export default function CompanyJobListPage() {
    const { jobs, currentCompanyId, deleteJob } = useAppStore();
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Filter jobs for the current company
        // Note: In a real app, this would likely be an API call or filtered on backend
        // For now, using client-side filtering of dummy data + local updates
        const filtered = jobs.filter(job => job.companyId === currentCompanyId);
        setMyJobs(filtered);
    }, [jobs, currentCompanyId]);

    const handleDelete = (id: string, title: string) => {
        if (confirm(`「${title}」を削除してもよろしいですか？`)) {
            deleteJob(id);
            toast.success('求人を削除しました');
        }
    };

    const filteredJobs = myJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">求人・クエスト管理</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        掲載中の求人やクエストの編集・管理ができます
                    </p>
                </div>
                <Link
                    href="/dashboard/company/jobs/new"
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    新規作成
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="求人タイトルやキーワードで検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 text-slate-700"
                    />
                </div>
            </div>

            {/* Job List */}
            {filteredJobs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <Briefcase className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-600">まだ求人がありません</h3>
                    <p className="text-slate-400 text-sm mb-6">新しい求人やクエストを作成して、<br />学生にアプローチしましょう！</p>
                    <Link
                        href="/dashboard/company/jobs/new"
                        className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                    >
                        <Plus size={18} />
                        はじめての求人を作成
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${job.type === 'quest' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {job.type === 'quest' ? 'クエスト' : '求人'}
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">
                                            {job.category}
                                        </span>
                                        {job.status === 'closed' && (
                                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold">
                                                募集終了
                                            </span>
                                        )}
                                    </div>
                                    <Link href={`/jobs/${job.id}`} className="block">
                                        <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            {job.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {job.workingHours || '勤務時間未設定'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                {job.salary || job.reward}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start">
                                    <Link
                                        href={`/dashboard/company/jobs/${job.id}`}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="編集"
                                    >
                                        <Edit3 size={18} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(job.id, job.title)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="削除"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                                <div>

                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <Eye size={14} />
                                        <span>128 views</span>
                                    </div>
                                    <Link
                                        href={`/jobs/${job.id}`}
                                        className="flex items-center gap-1 hover:text-indigo-600"
                                        target="_blank"
                                    >
                                        プレビュー
                                        <BrowseIcon size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function BrowseIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        </svg>
    );
}
