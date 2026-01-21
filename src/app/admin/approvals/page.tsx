"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ShieldCheck, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Organization = {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    representative_name?: string;
    website_url?: string;
};

export default function AdminApprovalsPage() {
    const supabase = createClient();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPendingOrganizations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('organizations')
            .select('id, name, status, created_at, representative_name, website_url')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error('データの取得に失敗しました');
        } else {
            setOrganizations(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingOrganizations();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        setProcessingId(id);
        const { error } = await supabase
            .from('organizations')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error(error);
            toast.error('ステータスの更新に失敗しました');
        } else {
            toast.success(newStatus === 'approved' ? '承認しました' : '却下しました');
            setOrganizations(prev => prev.filter(org => org.id !== id));
        }
        setProcessingId(null);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" />
                    企業承認申請
                </h1>
                <p className="text-slate-500 font-bold mt-1">
                    新規登録された企業の審査・承認を行います。
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-slate-400" />
                </div>
            ) : organizations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <ShieldCheck className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">現在、承認待ちの企業はありません。</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {organizations.map((org) => (
                        <div key={org.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{org.name}</h3>
                                <div className="text-sm text-slate-500 space-y-1 mt-2">
                                    <p>申請日時: {new Date(org.created_at).toLocaleString('ja-JP')}</p>
                                    {org.representative_name && <p>代表者: {org.representative_name}</p>}
                                    {org.website_url && (
                                        <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {org.website_url}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
