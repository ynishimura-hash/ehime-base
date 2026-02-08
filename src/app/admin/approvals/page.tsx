"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle, XCircle, Loader2, Clock, Globe, User } from 'lucide-react';
import { fetchAdminOrganizationsAction, updateOrganizationStatusAction } from '../actions';

type Organization = {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    representative_name?: string;
    website_url?: string;
};

export default function AdminApprovalsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const fetchOrganizations = async () => {
        setLoading(true);
        const result = await fetchAdminOrganizationsAction(filter);

        if (!result.success) {
            toast.error('データの取得に失敗しました');
        } else {
            setOrganizations(result.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrganizations();
    }, [filter]);

    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        setProcessingId(id);
        const result = await updateOrganizationStatusAction(id, newStatus);

        if (!result.success) {
            toast.error('ステータスの更新に失敗しました');
        } else {
            toast.success(newStatus === 'approved' ? '承認しました' : '却下しました');
            fetchOrganizations(); // Refetch to filter updates properly
        }
        setProcessingId(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><Clock size={12} />承認待ち</span>;
            case 'approved':
                return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1"><CheckCircle size={12} />承認済み</span>;
            case 'rejected':
                return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full flex items-center gap-1"><XCircle size={12} />却下</span>;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" />
                    企業承認申請
                </h1>
                <p className="text-slate-500 font-bold mt-1">
                    企業の審査・承認管理を行います。
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
            ) : organizations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <ShieldCheck className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">
                        {filter === 'pending'
                            ? '現在、承認待ちの企業はありません。'
                            : '企業が見つかりません。'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {organizations.map((org) => (
                        <div key={org.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-lg font-black text-slate-800">{org.name}</h3>
                                        {getStatusBadge(org.status)}
                                    </div>
                                    <div className="text-sm text-slate-500 space-y-1">
                                        <p className="flex items-center gap-2">
                                            <Clock size={14} className="text-slate-400" />
                                            申請日時: {new Date(org.created_at).toLocaleString('ja-JP')}
                                        </p>
                                        {org.representative_name && (
                                            <p className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                代表者: {org.representative_name}
                                            </p>
                                        )}
                                        {org.website_url && (
                                            <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
                                                <Globe size={14} />
                                                {org.website_url}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {org.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(org.id, 'rejected')}
                                                disabled={processingId === org.id}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <XCircle size={18} />
                                                却下
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(org.id, 'approved')}
                                                disabled={processingId === org.id}
                                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {processingId === org.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                承認
                                            </button>
                                        </>
                                    )}
                                    {org.status === 'rejected' && (
                                        <button
                                            onClick={() => handleUpdateStatus(org.id, 'approved')}
                                            disabled={processingId === org.id}
                                            className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <CheckCircle size={18} />
                                            再承認
                                        </button>
                                    )}
                                    {/* 承認済みの場合のボタン（必要なら停止など）は現状要件にないので表示のみか、必要に応じて追加 */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
