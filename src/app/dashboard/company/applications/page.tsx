
"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { User, MessageSquare, Calendar, ChevronRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

// Types
type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

interface Application {
    id: string;
    job_id: string;
    user_id: string;
    status: ApplicationStatus;
    created_at: string;
    jobs: { title: string };
    profiles: { full_name: string; email: string; avatar_url: string; user_type: string };
}

const STATUS_COLUMNS: { id: ApplicationStatus; label: string; color: string }[] = [
    { id: 'applied', label: '新規応募', color: 'bg-blue-50 text-blue-700' },
    { id: 'screening', label: '書類選考中', color: 'bg-yellow-50 text-yellow-700' },
    { id: 'interview', label: '面接', color: 'bg-purple-50 text-purple-700' },
    { id: 'offer', label: '内定・オファー', color: 'bg-pink-50 text-pink-700' },
    { id: 'hired', label: '採用決定', color: 'bg-green-50 text-green-700' },
    { id: 'rejected', label: '不採用', color: 'bg-slate-100 text-slate-500' },
];

export default function CompanyATSPage() {
    const { currentCompanyId } = useAppStore();
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentCompanyId) {
            fetchApplications();
        }
    }, [currentCompanyId]);

    const fetchApplications = async () => {
        setIsLoading(true);
        const supabase = createClient();

        // Join with jobs and profiles
        const { data, error } = await supabase
            .from('applications')
            .select(`
                *,
                jobs (title),
                profiles (full_name, email, avatar_url, user_type)
            `)
            .eq('organization_id', currentCompanyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error('応募データの取得に失敗しました');
        } else {
            setApplications(data as any || []);
        }
        setIsLoading(false);
    };

    const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', appId);

        if (error) {
            toast.error('ステータス更新に失敗しました');
        } else {
            toast.success('ステータスを更新しました');
            fetchApplications(); // Refresh (optimistic update would be better but keeping simple)
        }
    };

    if (isLoading) return <div className="p-10 text-center text-slate-400 font-bold">Loading ATS...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-800">応募者管理 (ATS)</h2>
                <p className="text-slate-500 text-sm font-bold mt-1">
                    現在の応募数: <span className="text-blue-600 text-lg">{applications.length}</span> 名
                </p>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[1200px] h-full">
                    {STATUS_COLUMNS.map(col => {
                        const colApps = applications.filter(a => a.status === col.id);

                        return (
                            <div key={col.id} className="w-80 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm h-full max-h-full">
                                <div className={`p-4 border-b border-slate-100 font-black flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10`}>
                                    <span className="text-slate-700">{col.label}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${col.color}`}>
                                        {colApps.length}
                                    </span>
                                </div>

                                <div className="p-3 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
                                    {colApps.length === 0 && (
                                        <div className="text-center py-10 text-slate-400 text-xs font-bold opacity-50">
                                            なし
                                        </div>
                                    )}
                                    {colApps.map(app => (
                                        <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    {app.profiles.avatar_url ? (
                                                        <img src={app.profiles.avatar_url} alt={app.profiles.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800 text-sm">{app.profiles.full_name}</h4>
                                                    <p className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded inline-block">
                                                        {app.profiles.user_type === 'student' ? '学生' : '求職者'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-xs font-bold text-slate-500 mb-3 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                                                <span className="block text-[10px] text-blue-400 mb-0.5">応募求人</span>
                                                {app.jobs.title}
                                            </div>

                                            <div className="text-[10px] text-slate-400 mb-3 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(app.created_at).toLocaleDateString()} に応募
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                                                <button
                                                    onClick={() => {/* TODO: Open Chat */ }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="メッセージ"
                                                >
                                                    <MessageSquare size={16} />
                                                </button>

                                                <div className="flex-1"></div>

                                                {/* Simple Next Status Button for now */}
                                                {col.id === 'applied' && (
                                                    <button onClick={() => updateStatus(app.id, 'screening')} className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                                                        書類通過 →
                                                    </button>
                                                )}
                                                {col.id === 'screening' && (
                                                    <button onClick={() => updateStatus(app.id, 'interview')} className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">
                                                        面接へ →
                                                    </button>
                                                )}
                                                {col.id === 'interview' && (
                                                    <button onClick={() => updateStatus(app.id, 'offer')} className="text-[10px] font-bold bg-pink-600 text-white px-3 py-1.5 rounded-lg hover:bg-pink-500 transition-colors">
                                                        内定出す →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
