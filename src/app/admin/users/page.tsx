"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import {
    Users, Shield, Building2, GraduationCap, User, Loader2,
    ShieldCheck, ShieldX, UserPlus, X, Eye, EyeOff,
    Search, ArrowUpDown, MoreVertical, Mail, Trash2, Ban, CheckCircle2,
    CheckSquare, Square, KeyRound, Edit, Save, RotateCcw, Calendar, Briefcase, School
} from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { AdminUserMessagesTab } from './AdminUserMessagesTab';

// ユーザーの型定義
type Profile = {
    id: string;
    email: string;
    full_name: string;
    user_type: 'student' | 'company' | 'specialist' | 'admin' | 'instructor' | 'partner';
    avatar_url: string | null;
    created_at: string;
    dob: string | null;
    gender?: 'male' | 'female' | 'other' | 'unspecified';
    occupation_status: 'student' | 'worker' | null;
    worker_status?: 'company_employee' | 'freelance' | 'civil_servant' | 'other';
    school_type?: 'junior_high' | 'high_school' | 'university' | 'vocational' | 'other';
    school_name?: string;
    school_faculty?: string;
    school_year?: string;
    university?: string;
    faculty?: string;
    company_name?: string;
    department?: string;
    position?: string;
    bio?: string;
    tags?: string[];
    phone?: string;
};

// ユーザータイプの表示名とアイコン
// student = ユーザー（社会人・学生）、partner = パートナー
const userTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    admin: { label: '管理者', icon: Shield, color: 'bg-red-100 text-red-700' },
    company: { label: '企業', icon: Building2, color: 'bg-blue-100 text-blue-700' },
    instructor: { label: '講師', icon: GraduationCap, color: 'bg-purple-100 text-purple-700' },
    student: { label: 'ユーザー', icon: User, color: 'bg-green-100 text-green-700' },
    partner: { label: 'パートナー', icon: User, color: 'bg-orange-100 text-orange-700' },
};

export default function AdminUsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<Profile[]>([]); // 表示用（フィルタリング後）
    const [rawUsers, setRawUsers] = useState<Profile[]>([]); // 取得した全データ
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('student');
    // 詳細モーダル用
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Profile>>({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
    const [menuDirection, setMenuDirection] = useState<'down' | 'up'>('down');
    // 新規ユーザー追加用（タブ連動）
    const [addModalType, setAddModalType] = useState<string | null>(null); // 'student' | 'company' | ...

    // 詳細モーダルの拡張情報
    type TabType = 'profile' | 'progress' | 'applications' | 'activities' | 'messages';
    const [activeDetailTab, setActiveDetailTab] = useState<TabType>('profile');

    // ... (inside the implementation) ...

    const [userProgress, setUserProgress] = useState<any[]>([]);
    const [userApplications, setUserApplications] = useState<any[]>([]);
    const [userActivities, setUserActivities] = useState<any[]>([]);
    const [userAnalysis, setUserAnalysis] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // 検索・ソート・選択
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    // 新規ユーザー追加モーダル
    const [showAddModal, setShowAddModal] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        fullName: '',
        userType: 'student' as string,
    });

    // 新規管理者追加モーダル（既存ユーザーから選択）
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [loadingAllUsers, setLoadingAllUsers] = useState(false);
    const [promoteSearchQuery, setPromoteSearchQuery] = useState('');

    // メール送信モーダル
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailTemplate, setEmailTemplate] = useState('');

    const EMAIL_TEMPLATES: Record<string, { subject: string, body: string }> = {
        'invite': {
            subject: '【重要】Ehime Baseへの招待',
            body: '{{name}}様\n\nEhime Baseへようこそ！\n以下のリンクからログインしてください。\n\nhttps://ehime-base.com/login'
        },
        'notice': {
            subject: '【お知らせ】システムメンテナンスについて',
            body: '{{name}}様\n\nいつもご利用ありがとうございます。\n以下の日程でメンテナンスを行います。\n\n...'
        }
    };

    // テンプレート適用
    const applyTemplate = (key: string) => {
        const template = EMAIL_TEMPLATES[key];
        if (template) {
            setEmailTemplate(key);
            setEmailSubject(template.subject);
            setEmailBody(template.body);
        } else {
            setEmailTemplate('');
            setEmailSubject('');
            setEmailBody('');
        }
    };

    // アクション実行関数
    const performAction = async (action: 'delete' | 'toggle_status' | 'reset_password' | 'update_profile', ids: string[], value?: any) => {
        if (action !== 'update_profile') {
            if (!confirm(`${ids.length}件のユーザーに対して操作を実行します。本当によろしいですか？`)) return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/users/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userIds: ids, value })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                fetchUsers();
                setSelectedUserIds(new Set());
                if (action === 'update_profile') {
                    // プロフィール更新成功時はモーダルを閉じるかリフレッシュなどの処理
                    // 今回は特に何もしない（fetchUsersで更新されるため）
                }
            } else {
                toast.error(data.error || 'エラーが発生しました');
            }
        } catch (e) {
            console.error(e);
            toast.error('エラーが発生しました');
        }
        setLoading(false);
    };

    // メール送信処理（モック）
    const handleSendEmail = () => {
        // ここで実際の送信APIを呼ぶ
        console.log('Sending email to:', Array.from(selectedUserIds));
        console.log('Subject:', emailSubject);
        console.log('Body:', emailBody);

        toast.success(`${selectedUserIds.size}名にメールを送信しました（デモ）`);
        setShowEmailModal(false);
        setSelectedUserIds(new Set());
        setEmailSubject('');
        setEmailBody('');
    };

    // 全ユーザーを取得（管理者昇格用）
    const fetchAllNonAdminUsers = async () => {
        setLoadingAllUsers(true);
        try {
            const response = await fetch('/api/admin/users?filter=all');
            const data = await response.json();
            if (!data.error) {
                // 管理者以外のユーザーのみフィルタリング
                setAllUsers((data.users || []).filter((u: Profile) => u.user_type !== 'admin'));
            }
        } catch (error) {
            console.error(error);
        }
        setLoadingAllUsers(false);
    };

    // モーダルを開くとき全ユーザー取得
    const handleOpenPromoteModal = () => {
        setShowPromoteModal(true);
        fetchAllNonAdminUsers();
    };

    // 検索フィルタリングされたユーザー（昇格用モーダル）
    const filteredAllUsers = allUsers.filter(u =>
        u.full_name?.toLowerCase().includes(promoteSearchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(promoteSearchQuery.toLowerCase())
    );

    const fetchUsers = async (withLoading = true) => {
        if (withLoading) setLoading(true);
        try {
            // APIエンドポイント経由でデータ取得（RLSバイパス）
            const response = await fetch(`/api/admin/users?filter=${filter}`);
            const data = await response.json();

            if (data.error) {
                console.error(data.error);
                toast.error('データの取得に失敗しました');
                setUsers([]);
                setRawUsers([]);
            } else {
                setRawUsers(data.users || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('データの取得に失敗しました');
            setUsers([]);
            setRawUsers([]);
        }
        if (withLoading) setLoading(false);
    };

    // フィルタリングとソートの適用
    useEffect(() => {
        let result = [...rawUsers];

        // 検索
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.full_name?.toLowerCase() || '').includes(query) ||
                (u.email?.toLowerCase() || '').includes(query)
            );
        }

        // ソート
        result.sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortOrder === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
            if (sortOrder === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
            return 0;
        });

        setUsers(result);
    }, [rawUsers, searchQuery, sortOrder]);

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    // 詳細モーダルが開いたときに関連データを取得
    useEffect(() => {
        if (!selectedUser) {
            setActiveDetailTab('profile');
            return;
        }

        const fetchUserDetails = async () => {
            setLoadingDetails(true);
            try {
                // 並列で取得
                const [progressRes, appsRes, logsRes, analysisRes] = await Promise.all([
                    supabase.from('course_progress').select(`
                        *,
                        course_lessons (
                            title,
                            course_curriculums (
                                title
                            )
                        )
                    `).eq('user_id', selectedUser.id).order('last_accessed_at', { ascending: false }),
                    supabase.from('applications').select(`
                        *,
                        jobs (
                            title,
                            organizations (
                                name
                            )
                        )
                    `).eq('user_id', selectedUser.id).order('created_at', { ascending: false }),
                    supabase.from('audit_logs').select('*')
                        .or(`user_id.eq.${selectedUser.id},record_id.eq.${selectedUser.id}`)
                        .order('created_at', { ascending: false })
                        .limit(50),
                    supabase.from('user_analysis').select('*').eq('user_id', selectedUser.id).single()
                ]);

                setUserProgress(progressRes.data || []);
                setUserApplications(appsRes.data || []);
                setUserActivities(logsRes.data || []);
                setUserAnalysis(analysisRes.data || null);

            } catch (err) {
                console.error('Failed to fetch user details:', err);
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchUserDetails();
    }, [selectedUser]);

    // 全選択・解除
    const handleSelectAll = () => {
        if (selectedUserIds.size === users.length && users.length > 0) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(users.map(u => u.id)));
        }
    };

    // 個別選択
    const toggleSelectUser = (id: string) => {
        const newSet = new Set(selectedUserIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedUserIds(newSet);
    };

    // 年齢計算
    const calculateAge = (dob: string | null) => {
        if (!dob) return '-';
        return differenceInYears(new Date(), new Date(dob)) + '歳';
    };

    // ユーザータイプを変更
    const handleChangeUserType = async (id: string, newType: string) => {
        setProcessingId(id);
        const { error } = await supabase
            .from('profiles')
            .update({ user_type: newType })
            .eq('id', id);

        if (error) {
            console.error(error);
            toast.error('ユーザータイプの変更に失敗しました');
        } else {
            toast.success(`ユーザータイプを「${userTypeConfig[newType]?.label || newType}」に変更しました`);
            fetchUsers(false); // サイレント更新
        }
        setProcessingId(null);
    };

    // 新規ユーザー追加
    const handleAddUser = async () => {
        if (!newUser.email || !newUser.password) {
            toast.error('メールアドレスとパスワードは必須です');
            return;
        }
        if (newUser.password.length < 6) {
            toast.error('パスワードは6文字以上にしてください');
            return;
        }

        setAddLoading(true);
        try {
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (data.error) {
                toast.error(data.error);
            } else if (data.warning) {
                toast.warning(data.warning);
                setAddModalType(null); // モーダルを閉じる
                setNewUser({ email: '', password: '', fullName: '', userType: 'admin' });
                fetchUsers(false); // サイレント更新
            } else {
                toast.success('ユーザーを作成しました');
                setAddModalType(null); // 追加モーダルを閉じる
                setNewUser({ email: '', password: '', fullName: '', userType: 'admin' });
                fetchUsers(false); // サイレント更新

                // 作成されたユーザーの詳細編集モーダルを自動で開く
                if (data.profile) {
                    setSelectedUser(data.profile);
                    setEditFormData(data.profile);
                    setIsEditing(true); // 編集モードで開く
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('ユーザー作成に失敗しました');
        }
        setAddLoading(false);
    };

    // プロフィール更新処理
    const handleUpdateProfile = async () => {
        if (!selectedUser) return;
        setUpdateLoading(true);
        try {
            await performAction('update_profile', [selectedUser.id], editFormData);
            // ローカルステート更新
            const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, ...editFormData } : u);
            const updatedRawUsers = rawUsers.map(u => u.id === selectedUser.id ? { ...u, ...editFormData } : u);
            setUsers(updatedUsers as Profile[]);
            setRawUsers(updatedRawUsers as Profile[]);
            setSelectedUser({ ...selectedUser, ...editFormData } as Profile);
            setIsEditing(false);
            toast.success('プロフィールを更新しました');
        } catch (error) {
            console.error(error);
            toast.error('更新に失敗しました');
        }
        setUpdateLoading(false);
    };

    // メニュー外クリック検知
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openActionMenuId && !(event.target as Element).closest('.action-menu-container')) {
                setOpenActionMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openActionMenuId]);

    // ユーザータイプバッジ
    const getUserTypeBadge = (type: string) => {
        const config = userTypeConfig[type] || { label: type, icon: User, color: 'bg-slate-100 text-slate-700' };
        const Icon = config.icon;
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${config.color}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" />
                        ユーザー管理
                    </h1>
                    <p className="text-slate-500 font-bold mt-1">
                        登録ユーザーの確認・権限変更を行います。
                    </p>
                </div>
            </div>


            {/* 検索・ソート・一括操作バー */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="名前、メールアドレスで検索"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 text-slate-700"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="newest">登録日が新しい順</option>
                        <option value="oldest">登録日が古い順</option>
                        <option value="name_asc">名前順 (昇順)</option>
                        <option value="name_desc">名前順 (降順)</option>
                    </select>

                    {/* 一括操作メニュー（選択時のみ表示） */}
                    {selectedUserIds.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                                {selectedUserIds.size}件選択中
                            </span>
                            <div className="bg-slate-800 text-white rounded-lg flex items-center overflow-hidden">
                                <button
                                    onClick={() => setShowEmailModal(true)}
                                    className="px-3 py-2 hover:bg-slate-700 transition-colors"
                                    title="一括メール送信"
                                >
                                    <Mail size={16} />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-600"></div>
                                <button
                                    onClick={() => performAction('delete', Array.from(selectedUserIds))}
                                    className="px-3 py-2 hover:bg-slate-700 transition-colors text-red-400"
                                    title="一括削除"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-600"></div>
                                <button className="px-3 py-2 hover:bg-slate-700 transition-colors" title="その他">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex gap-2 flex-wrap">
                    {[
                        { id: 'student', label: 'ユーザー', icon: User },
                        { id: 'company', label: '企業', icon: Building2 },
                        { id: 'instructor', label: '講師', icon: GraduationCap },
                        { id: 'partner', label: 'パートナー', icon: User },
                        { id: 'admin', label: '管理者', icon: Shield },
                        { id: 'all', label: 'すべて', icon: Users },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 font-bold rounded-xl transition-colors flex items-center gap-2 ${filter === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {filter !== 'all' && (
                    <button
                        onClick={() => {
                            setAddModalType(filter);
                            setNewUser(prev => ({ ...prev, userType: filter }));
                        }}
                        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        {userTypeConfig[filter]?.label}を追加
                    </button>
                )}
            </div>

            {/* 管理者数サマリー */}
            {filter === 'admin' && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                    <p className="text-red-700 font-bold flex items-center gap-2">
                        <Shield size={18} />
                        現在の管理者数: {users.length}名
                    </p>
                    <button
                        onClick={handleOpenPromoteModal}
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <ShieldCheck size={16} />
                        新規管理者を追加
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-slate-400" />
                </div>
            ) : users.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <Users className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">
                        該当するユーザーが見つかりません。
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 w-10">
                                    <button onClick={handleSelectAll} className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                                        {users.length > 0 && selectedUserIds.size === users.length ? (
                                            <CheckSquare size={20} className="text-blue-600" />
                                        ) : (
                                            <Square size={20} />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ユーザー</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">メールアドレス</th>
                                {filter === 'student' && (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">年齢</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">属性</th>
                                    </>
                                )}
                                {filter === 'all' && (
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">タイプ</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">登録日</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">アクション</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${selectedUserIds.has(user.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelectUser(user.id)} className="flex items-center justify-center text-slate-400 hover:text-slate-600">
                                            {selectedUserIds.has(user.id) ? (
                                                <CheckSquare size={20} className="text-blue-600" />
                                            ) : (
                                                <Square size={20} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="text-slate-400" size={20} />
                                                )}
                                            </div>
                                            <span className="font-bold text-slate-800">{user.full_name || '未設定'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
                                    {filter === 'student' && (
                                        <>
                                            <td className="px-6 py-4 text-slate-600 font-bold">{calculateAge(user.dob)}</td>
                                            <td className="px-6 py-4">
                                                {user.occupation_status === 'student' ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">学生</span>
                                                ) : user.occupation_status === 'worker' ? (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">社会人</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">-</span>
                                                )}
                                            </td>
                                        </>
                                    )}
                                    {filter === 'all' && (
                                        <td className="px-6 py-4">{getUserTypeBadge(user.user_type)}</td>
                                    )}
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative group action-menu-container">
                                            <button
                                                onClick={(e) => {
                                                    const isBottom = e.clientY > window.innerHeight / 2;
                                                    setMenuDirection(isBottom ? 'up' : 'down');
                                                    setOpenActionMenuId(openActionMenuId === user.id ? null : user.id);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${openActionMenuId === user.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openActionMenuId === user.id && (
                                                <div className={`absolute right-0 ${menuDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-10 animate-in fade-in zoom-in-95 duration-100`}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setEditFormData(user); // 初期値をセット
                                                            setIsEditing(false);
                                                            setOpenActionMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <Eye size={14} /> 詳細を見る
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserIds(new Set([user.id]));
                                                            setShowEmailModal(true);
                                                            setOpenActionMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <Mail size={14} /> メール送信
                                                    </button>

                                                    <div className="h-[1px] bg-slate-100 my-1"></div>

                                                    <button
                                                        onClick={() => {
                                                            const newPwd = prompt('新しいパスワードを入力してください（6文字以上）');
                                                            if (newPwd && newPwd.length >= 6) {
                                                                performAction('reset_password', [user.id], newPwd);
                                                            } else if (newPwd) {
                                                                toast.error('パスワードは6文字以上にしてください');
                                                            }
                                                            setOpenActionMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <KeyRound size={14} /> パスワード再設定
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            performAction('delete', [user.id]);
                                                            setOpenActionMenuId(null);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <Trash2 size={14} /> 削除
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 新規ユーザー追加モーダル */}
            {addModalType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <UserPlus className="text-blue-600" />
                                {userTypeConfig[addModalType]?.label || addModalType}を追加
                            </h2>
                            <button
                                onClick={() => setAddModalType(null)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    {addModalType === 'company' ? '企業名' : '氏名'}
                                </label>
                                <input
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    placeholder={addModalType === 'company' ? '例: 株式会社Ehime' : '例: 山田太郎'}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    メールアドレス <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="例: ehime@example.com"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">
                                    パスワード <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="6文字以上"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-12 text-slate-800 placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* タイプ固有フィールド */}
                            {addModalType === 'student' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-2">
                                        属性
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="userType"
                                                checked={true} // シンプル化のため、ここではuserTypeはstudent固定で、本来はProfileのoccupation_statusなどを設定させるべきだが、API側でデフォルト処理するか、後で編集させる
                                                onChange={() => { }}
                                                className="hidden peer"
                                            />
                                            {/* 学生/社会人の選択UIをここに入れるべきだが、APIのcreate-userがoccupation_statusに対応しているか確認が必要なため、一旦スキップして作成後に編集させるフローにするか、あるいはmetadataに入れる */}
                                            <span className="text-sm font-bold text-slate-500">※属性（学生/社会人）は作成後に詳細画面で設定してください</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {addModalType === 'company' && (
                                <div>
                                    {/* 企業固有の項目 */}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setAddModalType(null)}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={addLoading}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {addLoading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <UserPlus size={18} />
                                )}
                                作成
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 詳細・編集モーダル */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        {/* ヘッダー */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center border border-slate-100">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-slate-300" size={32} />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-black text-slate-800">{selectedUser.full_name || '名前未設定'}</h2>
                                        {getUserTypeBadge(selectedUser.user_type)}
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">{selectedUser.email}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                setIsEditing(false);
                            }}
                            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* タブナビゲーション */}
                    <div className="flex border-b border-slate-100 px-8 bg-white sticky top-0 z-10">
                        {[
                            { id: 'profile', label: 'プロフィール', icon: User },
                            { id: 'progress', label: 'E-Learning', icon: GraduationCap },
                            { id: 'applications', label: '応募状況', icon: Briefcase },
                            { id: 'activities', label: '活動履歴', icon: Calendar },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveDetailTab(tab.id as TabType)}
                                className={`px-6 py-4 font-bold text-sm flex items-center gap-2 transition-all border-b-2 ${activeDetailTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
                        {/* エンゲージメント概要カード (求職者のみ) */}
                        {(selectedUser.user_type === 'student' || selectedUser.user_type === 'specialist') && (
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">E-Learning</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-black text-blue-600">{userProgress.filter(p => p.status === 'completed').length}</span>
                                        <span className="text-xs font-bold text-slate-400 mb-1">/ {userProgress.length} 完了</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Applications</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-black text-green-600">{userApplications.length}</span>
                                        <span className="text-xs font-bold text-slate-400 mb-1">エントリー済</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Activities</p>
                                    <div className="flex items-end justify-between">
                                        <span className="text-2xl font-black text-orange-600">{userActivities.length}</span>
                                        <span className="text-xs font-bold text-slate-400 mb-1">件のログ</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Analysis</p>
                                    <div className="flex items-end justify-between">
                                        <span className={`text-2xl font-black ${userAnalysis ? 'text-purple-600' : 'text-slate-300'}`}>
                                            {userAnalysis ? '100' : '0'}<small className="text-sm">%</small>
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 mb-1">自己分析</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeDetailTab === 'profile' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* 基本情報 */}
                                <div className="col-span-full">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">基本情報</h3>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">氏名</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editFormData.full_name || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    ) : (
                                        <p className="text-slate-800 font-bold text-lg">{selectedUser.full_name || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">生年月日 / 年齢</label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editFormData.dob || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <p className="text-slate-800 font-bold text-lg">{selectedUser.dob || '-'}</p>
                                            <span className="text-slate-400 font-medium">({calculateAge(selectedUser.dob)})</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">電話番号</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editFormData.phone || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    ) : (
                                        <p className="text-slate-800 font-bold text-lg">{selectedUser.phone || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">性別</label>
                                    {isEditing ? (
                                        <select
                                            value={editFormData.gender || 'unspecified'}
                                            onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 bg-white"
                                        >
                                            <option value="unspecified">未指定</option>
                                            <option value="male">男性</option>
                                            <option value="female">女性</option>
                                            <option value="other">その他</option>
                                        </select>
                                    ) : (
                                        <p className="text-slate-800 font-bold text-lg">
                                            {selectedUser.gender === 'male' ? '男性' :
                                                selectedUser.gender === 'female' ? '女性' :
                                                    selectedUser.gender === 'other' ? 'その他' : '未指定'}
                                        </p>
                                    )}
                                </div>

                                {/* 属性情報 */}
                                <div className="col-span-full mt-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">詳細属性</h3>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">現在の状況</label>
                                    {isEditing ? (
                                        <div className="flex gap-4">
                                            <select
                                                value={editFormData.occupation_status || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, occupation_status: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 bg-white"
                                            >
                                                <option value="">選択してください</option>
                                                <option value="student">学生</option>
                                                <option value="worker">社会人</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {selectedUser.occupation_status === 'student' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full flex items-center gap-1">
                                                    <School size={14} /> 学生
                                                </span>
                                            )}
                                            {selectedUser.occupation_status === 'worker' && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center gap-1">
                                                    <Briefcase size={14} /> 社会人
                                                </span>
                                            )}
                                            {!selectedUser.occupation_status && <span className="text-slate-400">-</span>}
                                        </div>
                                    )}
                                </div>
                                {((isEditing ? editFormData.occupation_status : selectedUser.occupation_status) === 'student') && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">学校名</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.school_name || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, school_name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-bold text-lg">{selectedUser.school_name || '-'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">学部・学科</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.school_faculty || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, school_faculty: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-bold text-lg">{selectedUser.school_faculty || '-'}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                {((isEditing ? editFormData.occupation_status : selectedUser.occupation_status) === 'worker') && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">現在の勤務先</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.company_name || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-bold text-lg">{selectedUser.company_name || '-'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">役職・職種</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.position || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                                                />
                                            ) : (
                                                <p className="text-slate-800 font-bold text-lg">{selectedUser.position || '-'}</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="col-span-full">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">自己紹介</label>
                                    {isEditing ? (
                                        <textarea
                                            rows={4}
                                            value={editFormData.bio || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                                        />
                                    ) : (
                                        <div className="bg-white p-4 rounded-xl border border-slate-100 text-slate-600 font-bold whitespace-pre-wrap">
                                            {selectedUser.bio || '自己紹介文が未記入です'}
                                        </div>
                                    )}
                                </div>

                                {userAnalysis && (
                                    <div className="col-span-full mt-4">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">自己分析データ</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                                <p className="text-[10px] font-black text-purple-400 uppercase mb-1">Fortune Traits</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {userAnalysis.fortune_traits?.map((trait: string) => (
                                                        <span key={trait} className="bg-white px-2 py-1 rounded-md text-xs font-bold text-purple-600 shadow-sm border border-purple-100">
                                                            #{trait}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Values</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {userAnalysis.selected_values?.map((valId: number) => (
                                                        <span key={valId} className="bg-white px-2 py-1 rounded-md text-xs font-bold text-blue-600 shadow-sm border border-blue-100">
                                                            価値観 {valId}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeDetailTab === 'progress' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    学習中のコース・レッスン
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px]">{userProgress.length} items</span>
                                </h3>
                                {loadingDetails ? (
                                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                                ) : userProgress.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-2xl border border-dashed border-slate-200">学習データがありません</div>
                                ) : (
                                    <div className="grid gap-3">
                                        {userProgress.map((p) => (
                                            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {p.status === 'completed' ? <CheckCircle2 size={24} /> : <Loader2 size={24} className="animate-spin" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">{p.course_lessons?.course_curriculums?.title || 'Unknown Course'}</p>
                                                        <h4 className="font-bold text-slate-800">{p.course_lessons?.title || 'Unknown Lesson'}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {p.status === 'completed' ? '完了' : '学習中'}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold">最終アクセス: {new Date(p.last_accessed_at).toLocaleString('ja-JP')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {p.score !== undefined && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400">QUIZ SCORE</p>
                                                        <p className="text-lg font-black text-slate-800">{p.score}点</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeDetailTab === 'messages' && (
                            <AdminUserMessagesTab userId={selectedUser.id} />
                        )}

                        {activeDetailTab === 'applications' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    求人・クエストへの応募状況
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px]">{userApplications.length} items</span>
                                </h3>
                                {loadingDetails ? (
                                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                                ) : userApplications.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-2xl border border-dashed border-slate-200">応募履歴がありません</div>
                                ) : (
                                    <div className="grid gap-3">
                                        {userApplications.map((app) => (
                                            <div key={app.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">{app.jobs?.organizations?.name || 'Unknown Company'}</p>
                                                        <h4 className="font-bold text-slate-800">{app.jobs?.title || 'Unknown Job'}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${app.status === 'applied' ? 'bg-blue-50 text-blue-600' :
                                                                app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                                    'bg-green-50 text-green-600'
                                                                }`}>
                                                                {app.status}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold">応募日: {new Date(app.created_at).toLocaleDateString('ja-JP')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeDetailTab === 'activities' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    システム利用履歴 (監査ログ)
                                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px]">{userActivities.length} items</span>
                                </h3>
                                {loadingDetails ? (
                                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                                ) : userActivities.length === 0 ? (
                                    <div className="py-20 text-center text-slate-400 font-bold bg-white rounded-2xl border border-dashed border-slate-200">ログ記録がありません</div>
                                ) : (
                                    <div className="space-y-2">
                                        {userActivities.map((log) => {
                                            const isUpdate = log.action === 'UPDATE';
                                            const isInsert = log.action === 'INSERT';
                                            const isDelete = log.action === 'DELETE';

                                            return (
                                                <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 text-sm flex items-center gap-4 transition-all hover:border-slate-300">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isInsert ? 'bg-green-50 text-green-600' :
                                                        isUpdate ? 'bg-blue-50 text-blue-600' :
                                                            isDelete ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                                        }`}>
                                                        {isInsert ? <UserPlus size={18} /> :
                                                            isUpdate ? <Edit size={18} /> :
                                                                isDelete ? <Trash2 size={18} /> : <Calendar size={18} />
                                                        }
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-slate-800 tracking-tight">{log.action}</span>
                                                            <span className="px-1.5 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase">{log.table_name}</span>
                                                        </div>
                                                        {log.description ? (
                                                            <p className="text-slate-500 font-medium text-xs mt-0.5">{log.description}</p>
                                                        ) : (
                                                            <p className="text-slate-300 italic text-xs mt-0.5">No description provided</p>
                                                        )}
                                                        <div className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {new Date(log.created_at).toLocaleString('ja-JP')}
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-black text-slate-200 select-none">
                                                        #{log.id.slice(0, 8)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* フッター */}
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditFormData(selectedUser);
                                    }}
                                    className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <RotateCcw size={18} />
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={updateLoading}
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updateLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    変更を保存
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-2"
                            >
                                <Edit size={18} />
                                編集する
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 新規管理者追加モーダル（既存ユーザーから選択） */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <ShieldCheck className="text-red-600" />
                                新規管理者を追加
                            </h2>
                            <button
                                onClick={() => {
                                    setShowPromoteModal(false);
                                    setPromoteSearchQuery('');
                                }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <p className="text-slate-500 text-sm mb-4">
                            既存のユーザーから管理者に昇格させるユーザーを選択してください。
                        </p>

                        {/* 検索ボックス */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={promoteSearchQuery}
                                onChange={(e) => setPromoteSearchQuery(e.target.value)}
                                placeholder="名前またはメールアドレスで検索..."
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            />
                        </div>

                        {/* ユーザーリスト */}
                        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
                            {loadingAllUsers ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="animate-spin text-slate-400" />
                                </div>
                            ) : filteredAllUsers.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 font-bold">
                                    {promoteSearchQuery ? '該当するユーザーがいません' : '昇格できるユーザーがいません'}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredAllUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-4 hover:bg-slate-50 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-slate-400" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{user.full_name || '未設定'}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getUserTypeBadge(user.user_type)}
                                                <button
                                                    onClick={async () => {
                                                        await handleChangeUserType(user.id, 'admin');
                                                        setShowPromoteModal(false);
                                                        setPromoteSearchQuery('');
                                                    }}
                                                    disabled={processingId === user.id}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {processingId === user.id ? (
                                                        <Loader2 className="animate-spin" size={14} />
                                                    ) : (
                                                        <ShieldCheck size={14} />
                                                    )}
                                                    昇格
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => {
                                    setShowPromoteModal(false);
                                    setPromoteSearchQuery('');
                                }}
                                className="w-full px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* メール送信モーダル */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Mail className="text-blue-600" />
                                メール送信 ({selectedUserIds.size}名)
                            </h2>
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">テンプレート</label>
                                <select
                                    value={emailTemplate}
                                    onChange={(e) => applyTemplate(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                                >
                                    <option value="">テンプレートを選択...</option>
                                    {Object.entries(EMAIL_TEMPLATES).map(([key, tpl]) => (
                                        <option key={key} value={key}>{tpl.subject}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">件名</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="件名を入力"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-2">本文</label>
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                    placeholder="本文を入力（{{name}}で宛名を差し込み）"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Mail size={16} />
                                    送信する
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

