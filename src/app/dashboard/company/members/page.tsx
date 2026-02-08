
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { User, Mail, Link as LinkIcon, Plus, Copy, Check, Upload, FileText, AlertTriangle, RefreshCw, X, Download } from 'lucide-react';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { bulkCreateMembersAction } from '@/app/dashboard/company/actions/members';
import { motion, AnimatePresence } from 'framer-motion';

interface Member {
    id: string; // organization_member id
    role: string;
    joined_at: string;
    profiles: {
        full_name: string;
        email: string;
        avatar_url: string;
        gender?: string;
    };
}

interface Invitation {
    id: string;
    token: string;
    role: string;
    expires_at: string;
    created_at: string;
    is_used: boolean;
}

interface BulkResult {
    email: string;
    password?: string;
    fullName: string;
    status: 'success' | 'error';
    message?: string;
}

export default function CompanyMembersPage() {
    const { currentCompanyId } = useAppStore();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inviteUrl, setInviteUrl] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Bulk Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<BulkResult[] | null>(null);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentCompanyId) {
            refreshData();
        }
    }, [currentCompanyId]);

    const refreshData = () => {
        setIsLoading(true);
        setError(null);
        Promise.all([fetchMembers(), fetchInvitations()])
            .finally(() => setIsLoading(false));
    };

    const fetchMembers = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('organization_members')
                .select(`
                    id, role, joined_at,
                    profiles (full_name, email, avatar_url, gender)
                `)
                .eq('organization_id', currentCompanyId)
                .order('joined_at', { ascending: true });

            if (error) throw error;
            setMembers(data as any || []);
        } catch (e: any) {
            console.error('Fetch members error:', e);
            setError('メンバー情報の取得に失敗しました。');
            toast.error('メンバー情報の取得に失敗しました');
        }
    };

    const fetchInvitations = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('organization_invitations')
                .select('*')
                .eq('organization_id', currentCompanyId)
                .eq('is_used', false)
                .gt('expires_at', new Date().toISOString()) // Only valid ones
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvitations(data || []);
        } catch (e) {
            console.error('Fetch invitations error:', e);
            // Don't set main error state, just log
        }
    };

    const generateInvite = async () => {
        setIsGenerating(true);
        const supabase = createClient();

        // 1. Generate Token (Simple for MVP)
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        // 2. Insert
        const { data, error } = await supabase
            .from('organization_invitations')
            .insert([{
                organization_id: currentCompanyId,
                token: token,
                role: 'member',
                expires_at: expiresAt.toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error(error);
            toast.error('招待リンクの発行に失敗しました');
        } else {
            const link = `${window.location.origin}/invite/${token}`;
            setInviteUrl(link);
            fetchInvitations();
            toast.success('招待リンクを発行しました');
        }
        setIsGenerating(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentCompanyId) return;

        setIsUploading(true);
        // Close guide modal when upload starts
        setIsGuideModalOpen(false);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', currentCompanyId);

        try {
            const { results, error } = await bulkCreateMembersAction(currentCompanyId, formData);

            if (error) {
                toast.error(error);
            } else if (results) {
                setUploadResults(results as any);
                toast.success(`${results.length}件の処理が完了しました`);
                refreshData();
            }
        } catch (e) {
            console.error('Bulk upload error:', e);
            toast.error('アップロード処理中にエラーが発生しました');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('コピーしました');
    };

    const downloadCsvTemplate = () => {
        const csvContent = "姓,名,メールアドレス,権限\n山田,太郎,example@company.com,member\n鈴木,次郎,admin@company.com,admin";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'members_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendMail = (res: BulkResult) => {
        if (!res.password) return;
        const subject = encodeURIComponent('【Ehime Base】アカウント発行のお知らせ');
        const body = encodeURIComponent(`${res.fullName} 様\n\nEhime Baseのアカウントが発行されました。\n以下の情報でログインしてください。\n\nログインURL: ${window.location.origin}/login/company\nメールアドレス: ${res.email}\nパスワード: ${res.password}\n\n※ログイン後、パスワードの変更をお願いします。`);
        window.location.href = `mailto:${res.email}?subject=${subject}&body=${body}`;
    };

    const handleBulkEmailSend = async () => {
        if (!uploadResults) return;

        // Filter only success users with password
        const recipients = uploadResults
            .filter(r => r.status === 'success' && r.password)
            .map(r => ({
                email: r.email,
                fullName: r.fullName,
                password: r.password!
            }));

        if (recipients.length === 0) {
            toast.error('招待メールを送れる対象がいません');
            return;
        }

        const confirm = window.confirm(`${recipients.length}名に招待メールを送信しますか？\n（システム設定が必要です）`);
        if (!confirm) return;

        // Dynamic import to avoid server-only module issues in client component if handled improperly
        // But here we just use the action
        const { bulkSendInviteEmailAction: sendAction } = await import('@/app/dashboard/company/actions/send-email');

        try {
            const { results, error } = await sendAction(recipients);

            if (error) {
                toast.error(error); // API Key missing, etc.
            } else if (results) {
                const successCount = results.filter(r => r.status === 'success').length;
                if (successCount === recipients.length) {
                    toast.success('全員に招待メールを送信しました');
                } else {
                    toast.warning(`${successCount}/${recipients.length}名に送信成功しました。API設定やVerified Addressを確認してください`);
                }
            }
        } catch (e) {
            console.error('Email action failed:', e);
            toast.error('予期せぬエラーが発生しました');
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            <p className="text-slate-400 font-bold">データを読み込み中...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertTriangle className="text-red-500 w-12 h-12" />
            <p className="text-slate-800 font-bold text-lg">{error}</p>
            <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-colors"
            >
                <RefreshCw size={16} /> 再読み込み
            </button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">メンバー管理</h2>
                    <p className="text-slate-500 text-sm mt-1">チームメンバーを招待・管理して、採用活動を分担しましょう</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                    />
                    {/* Template button removed from here as it's moved to guide modal */}

                    <button
                        onClick={() => setIsGuideModalOpen(true)}
                        disabled={isUploading}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                        CSV一括登録
                    </button>
                    <button
                        onClick={generateInvite}
                        disabled={isGenerating}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                    >
                        <Plus size={18} />
                        {isGenerating ? '発行中...' : '招待リンク発行'}
                    </button>
                </div>
            </div>

            {/* Invite Link Area */}
            <AnimatePresence>
                {inviteUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-50 border border-green-200 rounded-2xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 bg-green-100/50 rounded-bl-3xl">
                            <Check className="text-green-600" size={24} />
                        </div>
                        <h3 className="font-bold text-green-800 flex items-center gap-2 mb-2 relative z-10">
                            招待リンクを発行しました
                        </h3>
                        <p className="text-xs text-green-700/80 mb-4 font-bold relative z-10">このリンクを招待したい相手に共有してください（有効期限: 7日間）</p>
                        <div className="flex gap-2 relative z-10">
                            <input
                                type="text"
                                readOnly
                                value={inviteUrl}
                                className="flex-1 bg-white/80 border border-green-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-600 focus:outline-none"
                            />
                            <button
                                onClick={() => copyToClipboard(inviteUrl)}
                                className="bg-green-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-sm"
                            >
                                <Copy size={18} /> コピー
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Members List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <User className="text-slate-400" /> 現在のメンバー
                    </h3>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{members.length}名</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {members.map(member => (
                        <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                    <img
                                        src={member.profiles?.avatar_url || getFallbackAvatarUrl(member.id, member.profiles?.gender)}
                                        alt={member.profiles?.full_name || 'User'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.getAttribute('data-error-tried')) {
                                                target.setAttribute('data-error-tried', 'true');
                                                target.src = getFallbackAvatarUrl(member.id, member.profiles?.gender);
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{member.profiles?.full_name || '名前未設定'}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{member.profiles?.email || 'メールアドレスなし'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${member.role === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {member.role === 'admin' ? '管理者' : 'メンバー'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className="p-10 text-center text-slate-400 font-medium">
                            メンバーがいません
                        </div>
                    )}
                </div>
            </div>

            {/* Active Invitations */}
            {invitations.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Mail className="text-slate-400" /> 保留中の招待
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {invitations.map(invite => (
                            <div key={invite.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 mb-1">招待リンク</p>
                                    <p className="text-xs text-slate-400 font-mono">.../invite/{invite.token.substring(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 mb-1">有効期限</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(invite.expires_at).toLocaleDateString()} まで
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CSV Guide Modal */}
            <AnimatePresence>
                {isGuideModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <FileText className="text-slate-400" /> CSV一括登録ガイド
                                </h3>
                                <button onClick={() => setIsGuideModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="p-8 space-y-8">
                                {/* Step 1: Template */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                                        <h4 className="font-bold text-slate-800">CSVテンプレートを準備</h4>
                                    </div>
                                    <div className="ml-11">
                                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                            以下のフォーマットのCSVファイルを作成してください。<br />
                                            <span className="text-xs bg-slate-100 px-1 py-0.5 rounded">header</span> 行は必須ではありませんが、誤動作を防ぐために推奨します。
                                        </p>
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm text-slate-600 mb-4 overflow-x-auto">
                                            <div className="flex border-b border-slate-200 pb-2 mb-2 font-bold text-slate-400">
                                                <div className="w-20 shrink-0">姓</div>
                                                <div className="w-20 shrink-0">名</div>
                                                <div className="w-48 shrink-0">メールアドレス</div>
                                                <div className="w-20 shrink-0">権限</div>
                                            </div>
                                            <div className="flex text-slate-800">
                                                <div className="w-20 shrink-0">山田</div>
                                                <div className="w-20 shrink-0">太郎</div>
                                                <div className="w-48 shrink-0">user@example.com</div>
                                                <div className="w-20 shrink-0">member</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={downloadCsvTemplate}
                                            className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                                        >
                                            <Download size={16} /> テンプレートをダウンロード
                                        </button>
                                    </div>
                                </div>

                                {/* Step 2: Upload */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                                        <h4 className="font-bold text-slate-800">ファイルを選択して登録</h4>
                                    </div>
                                    <div className="ml-11">
                                        <p className="text-sm text-slate-500 mb-4">
                                            作成したCSVファイルをアップロードしてください。<br />
                                            アップロード後、各設定内容の確認画面が表示されます。
                                        </p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full bg-slate-800 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-900 flex items-center justify-center gap-2 shadow-lg transition-all"
                                        >
                                            <Upload size={20} />
                                            ファイルを選択してアップロード
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Upload Results Modal */}
            <AnimatePresence>
                {uploadResults && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">一括登録結果</h3>
                                    <p className="text-sm text-slate-500 font-bold mt-1">以下のユーザーが処理されました。パスワード情報は一度しか表示されません。</p>
                                </div>
                                <button onClick={() => setUploadResults(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Send All Button Area */}
                                <div className="mb-4 flex justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                    <div className="text-sm text-blue-800 font-bold">
                                        <p>システムから直接招待メールを一括送信できます。</p>
                                        <p className="text-xs text-blue-600 font-normal mt-1">※Resend等のAPI設定が必要です。</p>
                                    </div>
                                    <button
                                        onClick={handleBulkEmailSend}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors whitespace-nowrap"
                                    >
                                        <Mail size={16} /> 一括送信を実行
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {uploadResults.map((res, i) => (
                                        <div key={i} className={`p-4 rounded-xl border ${res.status === 'success' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {res.status === 'success' ? <Check size={18} className="text-green-600" /> : <AlertTriangle size={18} className="text-red-600" />}
                                                    <span className="font-bold text-slate-800">{res.fullName}</span>
                                                    <span className="text-xs text-slate-400 font-mono ml-2">{res.email}</span>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${res.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {res.status === 'success' ? '登録成功' : 'エラー'}
                                                </span>
                                            </div>
                                            {res.status === 'success' && res.password && (
                                                <div className="mt-2 space-y-3">
                                                    <div className="bg-white p-3 rounded-lg border border-green-200 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-400 block mb-1">初期パスワード</span>
                                                            <span className="font-mono text-lg font-bold text-slate-800 tracking-wider">{res.password}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSendMail(res)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                                                                title="手動でメール作成（メーラー起動）"
                                                            >
                                                                <Mail size={14} /> 個別作成
                                                            </button>
                                                            <button onClick={() => copyToClipboard(res.password!)} className="text-green-600 hover:text-green-700 p-2" title="パスワードをコピー">
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {res.status === 'error' && (
                                                <p className="text-sm text-red-600 font-bold mt-1">{res.message}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                                <button
                                    onClick={() => setUploadResults(null)}
                                    className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors"
                                >
                                    閉じる
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
