'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Clock,
    User,
    Database,
    Activity,
    Search,
    Filter,
    ArrowLeft,
    Trash2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Eye
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function AdminAuditLogPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { activeRole } = useAppStore();

    useEffect(() => {
        if (activeRole === 'admin') {
            fetchLogs();
        }
    }, [activeRole]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/system/audit');
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching logs:', errorData);
                // Handle error state gracefully (maybe show toast)
            } else {
                const data = await response.json();
                setLogs(data || []);
            }
        } catch (error) {
            console.error('Exception fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'delete': return <Trash2 size={14} className="text-red-500" />;
            case 'create': return <Activity size={14} className="text-green-500" />;
            case 'update': return <RefreshCw size={14} className="text-blue-500" />;
            case 'approve': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'reject': return <XCircle size={14} className="text-rose-500" />;
            default: return <Database size={14} className="text-slate-400" />;
        }
    };

    if (activeRole !== 'admin') {
        return <div className="p-20 text-center">アクセス権限がありません</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-600 mb-2 font-bold text-sm"
                    >
                        <ArrowLeft size={16} />
                        管理ポータルに戻る
                    </button>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Database className="text-blue-600" />
                        監査ログ・削除履歴
                    </h1>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ユーザーID、テーブル名、アクションで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">日付</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">操作</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">対象テーブル</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">実行ユーザー</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">詳細</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">レコードID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">読み込み中...</td>
                                </tr>
                            ) : logs.length > 0 ? logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <Clock size={12} />
                                            {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getActionIcon(log.action)}
                                            <span className="text-xs font-black uppercase tracking-wide">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">
                                            {log.table_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                            <User size={12} className="text-slate-400" />
                                            {log.user_id?.substring(0, 8)}...
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-600 font-medium max-w-xs truncate">
                                            {log.description || '-'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-[10px] font-mono text-slate-400">{log.record_id.substring(0, 8)}</span>
                                            <button className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all">
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">ログが見つかりません</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
