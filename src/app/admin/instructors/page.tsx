"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { GraduationCap, CheckCircle, XCircle, Loader2, BadgeCheck, Clock, User } from 'lucide-react';
import { fetchInstructorsAction, updateInstructorStatusAction, toggleInstructorOfficialAction } from '../actions';

// 講師の型定義
type Instructor = {
    id: string;
    user_id: string;
    display_name: string;
    bio: string | null;
    specialization: string | null;
    profile_image: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    is_official: boolean;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
        avatar_url: string | null;
    };
};

export default function AdminInstructorsPage() {
    const supabase = createClient();
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchInstructors = async () => {
        setLoading(true);
        const result = await fetchInstructorsAction(filter);

        if (!result.success) {
            // テーブルが存在しない場合のエラーハンドリング (Server Action側でキャッチされるエラー文字列をチェック)
            if (result.error && result.error.includes('does not exist')) {
                // Ignore or specific handling
            }
            toast.error(`データの取得に失敗しました: ${result.error}`);
            setInstructors([]);
        } else {
            setInstructors(result.data as any || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInstructors();
    }, [filter]);

    // 講師のステータスを更新
    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'suspended') => {
        setProcessingId(id);
        const result = await updateInstructorStatusAction(id, newStatus);

        if (!result.success) {
            toast.error('ステータスの更新に失敗しました');
        } else {
            const messages = {
                approved: '講師を承認しました',
                rejected: '講師申請を却下しました',
                suspended: '講師を停止しました'
            };
            toast.success(messages[newStatus]);
            fetchInstructors();
        }
        setProcessingId(null);
    };

    // 公式講師フラグを切り替え
    const handleToggleOfficial = async (id: string, currentValue: boolean) => {
        setProcessingId(id);
        const result = await toggleInstructorOfficialAction(id, currentValue);

        if (!result.success) {
            toast.error('公式講師設定の更新に失敗しました');
        } else {
            toast.success(!currentValue ? '公式講師に設定しました' : '公式講師設定を解除しました');
            fetchInstructors();
        }
        setProcessingId(null);
    };

    // ステータスバッジ
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><Clock size={12} />承認待ち</span>;
            case 'approved':
                return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1"><CheckCircle size={12} />承認済み</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full flex items-center gap-1"><XCircle size={12} />却下</span>;
            case 'suspended':
                return <span className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-500 rounded-full">停止中</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" />
                    講師管理
                </h1>
                <p className="text-slate-500 font-bold mt-1">
                    講師の承認・管理を行います。
                </p>
            </div>

            {/* フィルタータブ */}
            <div className="flex gap-2 mb-6">
                {[
                    { id: 'all', label: 'すべて' },
                    { id: 'pending', label: '承認待ち' },
                    { id: 'approved', label: '承認済み' },
                    { id: 'rejected', label: '却下' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as typeof filter)}
                        className={`px-4 py-2 font-bold rounded-xl transition-colors ${filter === tab.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-slate-400" />
                </div>
            ) : instructors.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <GraduationCap className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">
                        {filter === 'pending'
                            ? '現在、承認待ちの講師はいません。'
                            : '講師が見つかりません。'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {instructors.map((instructor) => (
                        <div key={instructor.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {/* アバター */}
                                    <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                                        {instructor.profile_image || instructor.profiles.avatar_url ? (
                                            <img
                                                src={instructor.profile_image || instructor.profiles.avatar_url || ''}
                                                alt={instructor.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="text-slate-400" size={24} />
                                        )}
                                    </div>

                                    {/* 講師情報 */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-black text-slate-800">{instructor.display_name}</h3>
                                            {instructor.is_official && (
                                                <span title="公式講師"><BadgeCheck className="text-blue-600" size={18} /></span>
                                            )}
                                            {getStatusBadge(instructor.status)}
                                        </div>
                                        <p className="text-sm text-slate-500 mb-2">
                                            {instructor.profiles.full_name} ({instructor.profiles.email})
                                        </p>
                                        {instructor.specialization && (
                                            <p className="text-sm text-slate-600 mb-1">
                                                <span className="font-bold">専門:</span> {instructor.specialization}
                                            </p>
                                        )}
                                        {instructor.bio && (
                                            <p className="text-sm text-slate-500 line-clamp-2">{instructor.bio}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-2">
                                            申請日: {new Date(instructor.created_at).toLocaleDateString('ja-JP')}
                                        </p>
                                    </div>
                                </div>

                                {/* アクションボタン */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {instructor.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(instructor.id, 'rejected')}
                                                disabled={processingId === instructor.id}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                却下
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(instructor.id, 'approved')}
                                                disabled={processingId === instructor.id}
                                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {processingId === instructor.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                承認
                                            </button>
                                        </>
                                    )}

                                    {instructor.status === 'approved' && (
                                        <>
                                            <button
                                                onClick={() => handleToggleOfficial(instructor.id, instructor.is_official)}
                                                disabled={processingId === instructor.id}
                                                className={`px-4 py-2 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${instructor.is_official
                                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <BadgeCheck size={18} />
                                                {instructor.is_official ? '公式解除' : '公式設定'}
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(instructor.id, 'suspended')}
                                                disabled={processingId === instructor.id}
                                                className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                停止
                                            </button>
                                        </>
                                    )}

                                    {instructor.status === 'rejected' && (
                                        <button
                                            onClick={() => handleUpdateStatus(instructor.id, 'approved')}
                                            disabled={processingId === instructor.id}
                                            className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            再承認
                                        </button>
                                    )}

                                    {instructor.status === 'suspended' && (
                                        <button
                                            onClick={() => handleUpdateStatus(instructor.id, 'approved')}
                                            disabled={processingId === instructor.id}
                                            className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            復活
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
