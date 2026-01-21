"use client";

import React, { useState, Suspense } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Building2, Briefcase, GraduationCap, Users,
    Search, Edit3, Trash2, Eye, X, CheckSquare, Square,
    Plus, ChevronLeft, Upload, Video, FileVideo, Save, ArrowRight, Link as LinkIcon
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
    const [editMode, setEditMode] = useState<'company' | 'job' | 'user' | 'media' | null>(null);
    const [actionType, setActionType] = useState<'create' | 'edit'>('edit');
    const [modalTab, setModalTab] = useState<'basic' | 'detail' | 'activity' | 'analysis'>('basic');
    const [relatedData, setRelatedData] = useState<any>({ applications: [], logs: [], bookmarks: [], courses: [] });

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

    const fetchRelatedData = async (userId: string) => {
        const { data: courses } = await supabase.from('course_progress').select('*, courses(*)').eq('user_id', userId);
        const { data: applications } = await supabase.from('applications').select('*, jobs(*)').eq('user_id', userId);
        const { data: bookmarks } = await supabase.from('bookmarks').select('*').eq('user_id', userId);
        const { data: logs } = await supabase.from('view_logs').select('*').eq('user_id', userId).order('viewed_at', { ascending: false }).limit(20);

        setRelatedData({
            courses: courses || [],
            applications: applications || [],
            bookmarks: bookmarks || [],
            logs: logs || []
        });
    };

    const fetchCompanies = async () => {
        const { data, error } = await supabase.from('organizations').select('*').eq('type', 'company').order('created_at', { ascending: false });
        if (error) console.error(error);
        else setRealCompanies(data || []);
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


    // --- CSV Mapping State ---

    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [csvMapping, setCsvMapping] = useState<Record<string, string>>({}); // dbField -> csvHeader
    const [showCsvModal, setShowCsvModal] = useState(false);
    const [csvTargetType, setCsvTargetType] = useState<'company' | 'job' | 'user' | 'course' | null>(null);

    // Video / Media State
    const [videoLinkType, setVideoLinkType] = useState<'file' | 'youtube'>('file');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [linkTargetType, setLinkTargetType] = useState<'none' | 'company' | 'job' | 'quest'>('none');
    const [linkTargetId, setLinkTargetId] = useState('');
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [isAiParsing, setIsAiParsing] = useState(false);


    // ... (Keep DB Fields Definitions as they are) ... (Wait, I replaced them in previous step, so I should just focus on executeCsvImport)




    // DB Fields Definition with Labels
    const COMPANY_FIELDS = {
        name: '企業名 (必須)',
        industry: '業界',
        location: '所在地',
        representative_name: '代表者名',
        established_date: '設立日',
        employee_count: '従業員数',
        capital: '資本金',
        business_content: '事業内容',
        phone: '電話番号',
        website_url: 'WebサイトURL',
        description: '説明文'
    };

    const JOB_FIELDS = {
        title: '求人タイトル (必須)',
        type: 'タイプ (job/quest)',
        content: '詳細内容',
        salary: '給与',
        employment_type: '雇用形態',
        working_hours: '勤務時間',
        holidays: '休日',
        benefits: '福利厚生',
        qualifications: '応募条件',
        access: 'アクセス',
        company_name: '企業名 (一致する企業に紐付け)'
    };

    const USER_FIELDS = {
        email: 'メールアドレス (必須)',
        password: 'パスワード (空欄なら仮PW)',
        full_name: '氏名',
        user_type: 'タイプ (student/company/admin)',
        first_name: '名',
        last_name: '姓',
        phone: '電話番号',
        university: '大学',
        faculty: '学部',
        company_name: '会社名(企業ユーザーの場合)',
        department: '部署(企業ユーザーの場合)',
        bio: '自己紹介'
    };

    const COURSE_FIELDS = {
        title: 'コース名 (必須)',
        description: '説明',
        category: 'カテゴリー',
        level: 'レベル (beginner/intermediate/advanced)',
        duration: '所要時間',
        image: '画像URL'
    };

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'company' | 'job' | 'user' | 'course') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        setCsvTargetType(type);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                toast.error('有効なデータが含まれていません');
                return;
            }

            // Robust CSV parsing (handling quotes)
            const parseCSVLine = (line: string) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim().replace(/^"|"$/g, ''));
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim().replace(/^"|"$/g, ''));
                return result;
            };

            const headers = parseCSVLine(lines[0]);
            const data = lines.slice(1).map(line => {
                const values = parseCSVLine(line);
                return headers.reduce((obj, header, index) => {
                    obj[header] = values[index] || '';
                    return obj;
                }, {} as any);
            });

            setCsvHeaders(headers);
            setCsvData(data);

            // AI-like Auto Mapping
            const initialMapping: Record<string, string> = {};
            let targetFields = {};
            if (type === 'company') targetFields = COMPANY_FIELDS;
            else if (type === 'job') targetFields = JOB_FIELDS;
            else if (type === 'user') targetFields = USER_FIELDS;
            else if (type === 'course') targetFields = COURSE_FIELDS;

            // Synonym Dictionary
            const synonyms: Record<string, string[]> = {
                // Common
                name: ['企業名', '会社名', 'Company', 'Name', '事業所名', '商号'],
                title: ['タイトル', '職種', 'Title', 'Role', 'Position', 'コース名', '求人タイトル'],
                description: ['説明', '詳細', 'Description', 'Detail', '自己紹介', 'プロフィール', 'Bio'],

                // Contact / Info
                website_url: ['URL', 'Web', 'HP', 'ホームページ', 'リンク', 'サイト'],
                email: ['メール', 'Email', 'Address', 'Mail'],
                phone: ['電話', 'TEL', 'Phone', 'Mobile', '連絡先'],
                location: ['住所', '所在地', 'Location', 'Address', '勤務地', 'アクセス'],

                // Company Specific
                industry: ['業界', '業種', 'Industry', 'Category', '分野'],
                representative_name: ['代表', '社長', 'Representative', 'CEO'],
                established_date: ['設立', '創業', 'Established', 'Date'],
                employee_count: ['従業員', '社員数', 'Staff', 'Count', '人数'],
                capital: ['資本金', 'Capital'],
                business_content: ['事業内容', 'Business', 'Service'],

                // Job Specific
                content: ['仕事内容', '業務内容', 'Content', 'Description'],
                salary: ['給与', '賃金', 'Salary', 'Pay', '年収', '月給', '報酬'],
                employment_type: ['雇用形態', 'Type', '契約', 'Employment'],
                working_hours: ['勤務時間', 'Hours', 'Time', '就業時間'],
                holidays: ['休日', '休暇', 'Holiday', 'Vacation'],
                benefits: ['福利厚生', 'Benefits', '待遇', '手当'],
                qualifications: ['応募条件', '資格', 'スキル', 'Requirements', 'Qualifications'],
                company_name: ['企業名', '会社名', 'Company'], // For linking jobs to companies

                // User Specific
                last_name: ['姓', '氏', 'LastName', 'FamilyName'],
                first_name: ['名', 'FirstName', 'GivenName'],
                full_name: ['氏名', '名前', 'FullName', 'Name'],
                university: ['大学', 'University', 'School', '学歴'],
                faculty: ['学部', 'Faculty', 'Department', 'Major'],
                department: ['部署', 'Department', 'Division'],

                // Course Specific
                category: ['カテゴリ', '分野', 'Category', 'Subject'],
                level: ['レベル', '難易度', 'Level', 'Difficulty'],
                duration: ['所要時間', '時間', 'Duration', 'Length'],
                image: ['画像', 'サムネイル', 'Image', 'Thumbnail']
            };

            const sampleRow = data[0] || {};

            Object.keys(targetFields).forEach(dbField => {
                // 1. Check Header Synonyms
                let bestMatch = headers.find(h => {
                    const cleanHeader = h.toLowerCase().replace(/[\s_]/g, '');
                    const fieldSynonyms = synonyms[dbField] || [];
                    return fieldSynonyms.some(s => cleanHeader.includes(s.toLowerCase()));
                });

                // 2. Check Content Patterns (Heuristics)
                if (!bestMatch) {
                    const potentialMatch = headers.find(h => {
                        const val = String(sampleRow[h] || '').trim();
                        if (!val || val.length > 300) return false;

                        // Universal
                        if (dbField === 'website_url' && (val.startsWith('http') || val.includes('www.'))) return true;
                        if (dbField === 'email' && val.includes('@') && val.includes('.')) return true;
                        if (dbField === 'phone' && (val.match(/^[\d-]{10,15}$/) || val.startsWith('090') || val.startsWith('080'))) return true;

                        // Specifics
                        if (dbField === 'salary' && (val.includes('円') || val.includes('万円'))) return true;
                        if (dbField === 'working_hours' && val.includes(':')) return true;
                        if (dbField === 'level' && (val === 'beginner' || val === 'intermediate' || val.includes('級'))) return true;
                        if (dbField === 'name' && (val.includes('株式会社') || val.includes('有限会社'))) return true;

                        return false;
                    });
                    if (potentialMatch) bestMatch = potentialMatch;
                }

                if (bestMatch) {
                    initialMapping[dbField] = bestMatch;
                }
            });

            setCsvMapping(initialMapping);
            setShowCsvModal(true);

            if (event.target) event.target.value = '';
        };
        reader.readAsText(file);
    };

    // Helper for YouTube ID
    const getYouTubeID = (url: string) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(shorts\/))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[8].length === 11) ? match[8] : '';
    };




    const executeCsvImport = async () => {
        if (!csvTargetType) return;

        try {
            let successCount = 0;
            let errorCount = 0;

            for (const row of csvData) {
                const item: any = {};
                // Map values
                Object.entries(csvMapping).forEach(([dbField, csvHeader]) => {
                    if (csvHeader) {
                        item[dbField] = row[csvHeader];
                    }
                });

                // Validation & Transformation
                if (csvTargetType === 'company') {
                    if (!item.name) { errorCount++; continue; }

                    const { error } = await supabase.from('organizations').insert([{ ...item, type: 'company' }]);
                    if (error) { console.error(error); errorCount++; } else { successCount++; }

                } else if (csvTargetType === 'job') {
                    if (!item.title) { errorCount++; continue; }

                    // Find company ID if company_name provided
                    if (item.company_name) {
                        const { data: company } = await supabase.from('organizations').select('id').eq('name', item.company_name).eq('type', 'company').single();
                        if (company) item.organization_id = company.id;
                    }
                    if (!item.organization_id && realCompanies.length > 0) {
                        // Fallback: Use first company or admin company? For now, skip if no link.
                        // Or create without company.
                    }
                    delete item.company_name; // Remove auxiliary field

                    const { error } = await supabase.from('jobs').insert([item]);
                    if (error) { console.error(error); errorCount++; } else { successCount++; }
                }
            }

            toast.success(`インポート完了: 成功 ${successCount}件, 失敗 ${errorCount}件`);
            setShowCsvModal(false);
            if (csvTargetType === 'company') fetchCompanies();
            if (csvTargetType === 'job') fetchJobs();

        } catch (error: any) {
            console.error(error);
            toast.error('インポート中にエラーが発生しました');
        }
    };

    // --- Render ---

    // ... (Existing render methods)



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
                        onClick={() => { setEditingItem({}); setEditMode('user'); setActionType('create'); setModalTab('basic'); }}
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
                                        onClick={() => {
                                            setEditingItem(user);
                                            setEditMode('user');
                                            setActionType('edit');
                                            setModalTab('basic');
                                            fetchRelatedData(user.id);
                                        }}
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



    const handleMediaSubmit = async () => {
        try {
            setUploading(true);
            let publicUrl = '';
            let filename = '';
            let type = 'file';
            let storageFilePath = '';

            if (videoLinkType === 'file') {
                const file = videoInputRef.current?.files?.[0];
                if (!file) return;

                filename = file.name;
                const fileExt = file.name.split('.').pop();
                storageFilePath = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('videos')
                    .upload(storageFilePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('videos').getPublicUrl(storageFilePath);
                publicUrl = data.publicUrl;
            } else {
                // YouTube
                if (!youtubeUrl) return;
                publicUrl = youtubeUrl;
                filename = 'YouTube Video'; // Or fetch title if possible, for now static or user input
                type = 'youtube';
                storageFilePath = 'youtube'; // Dummy value for NOT NULL constraint
            }

            // Insert into DB
            const item: any = {
                filename,
                public_url: publicUrl,
                storage_path: storageFilePath,
                type,
                // created_at is default
            };

            if (linkTargetType === 'company' && linkTargetId) item.organization_id = linkTargetId;
            if ((linkTargetType === 'job' || linkTargetType === 'quest') && linkTargetId) item.job_id = linkTargetId;

            const { error: dbError } = await supabase.from('media_library').insert([item]);
            if (dbError) throw dbError;

            toast.success('メディアを追加しました');
            fetchMedia();
            setYoutubeUrl('');
            if (videoInputRef.current) videoInputRef.current.value = '';
            setLinkTargetType('none');
            setLinkTargetId('');

        } catch (error: any) {
            console.error('Video Upload Error:', error);
            toast.error(`エラーが発生しました: ${error.message || error.error_description || '詳細はコンソールをご確認ください'}`);
        } finally {
            setUploading(false);
        }
    };

    const renderMediaModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-700">新規動画追加</h3>
                    <button onClick={() => setShowMediaModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">動画タイプ</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setVideoLinkType('file')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${videoLinkType === 'file' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                ファイルアップロード
                            </button>
                            <button
                                onClick={() => setVideoLinkType('youtube')}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${videoLinkType === 'youtube' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                            >
                                YouTube URL
                            </button>
                        </div>

                        {videoLinkType === 'file' ? (
                            <input
                                type="file"
                                accept="video/*"
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                ref={videoInputRef}
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder="YouTube URL (Shorts対応)..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">関連付け (オプション)</label>
                        <div className="flex gap-2 mb-2">
                            <select
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-700"
                                value={linkTargetType}
                                onChange={(e) => { setLinkTargetType(e.target.value as any); setLinkTargetId(''); }}
                            >
                                <option value="none">なし (Reelsのみ)</option>
                                <option value="company">企業</option>
                                <option value="job">求人</option>
                                <option value="quest">クエスト</option>
                            </select>
                            {linkTargetType !== 'none' && (
                                <select
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-700"
                                    value={linkTargetId}
                                    onChange={(e) => setLinkTargetId(e.target.value)}
                                >
                                    <option value="">選択してください</option>
                                    {linkTargetType === 'company' && realCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    {linkTargetType === 'job' && realJobs.filter(j => j.type !== 'quest').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                                    {linkTargetType === 'quest' && realJobs.filter(j => j.type === 'quest').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                                </select>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-bold">
                            求人や企業に紐付けると、その詳細ページにも動画が表示されます。
                        </p>
                    </div>
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={handleMediaSubmit}
                        disabled={uploading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                    >
                        {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Upload size={18} />}
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );

    const renderMedia = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">メディア(動画)管理</h2>
                <button
                    onClick={() => setShowMediaModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                >
                    <Plus size={18} /> 新規動画追加
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm p-6">
                {mediaItems.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-bold">
                        <FileVideo size={48} className="mx-auto mb-4 opacity-20" />
                        動画はまだアップロードされていません
                    </div>
                ) : (
                    <div className="space-y-3">
                        {mediaItems.map((item) => {
                            const isShorts = item.public_url.includes('shorts/');
                            return (
                                <div key={item.id} className="group flex items-start gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors">
                                    {/* Thumbnail Area - Compact & Unified Vertical Ratio */}
                                    <div className="shrink-0 w-24 aspect-[9/16] bg-black rounded-lg overflow-hidden relative shadow-sm">
                                        {item.type === 'youtube' ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${getYouTubeID(item.public_url)}`}
                                                title="YouTube"
                                                frameBorder="0"
                                                className="pointer-events-none" // Disable interaction in list view for meaningful drag/click if needed, but here just display
                                            />
                                        ) : (
                                            <video src={item.public_url} className="w-full h-full object-cover" />
                                        )}
                                        {item.type === 'youtube' && <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded shadow-sm">YT</span>}
                                    </div>

                                    {/* Info Area */}
                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-black text-slate-800 text-sm truncate pr-4" title={item.filename}>
                                                    {item.filename || 'No Title'}
                                                </p>
                                                {/* Linked Info Tags */}
                                                {(item.organization_id || item.job_id) && (
                                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                                        {item.organization_id && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                                                                <Building2 size={10} /> {realCompanies.find(c => c.id === item.organization_id)?.name}
                                                            </span>
                                                        )}
                                                        {item.job_id && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-blue-600">
                                                                <Briefcase size={10} /> {realJobs.find(j => j.id === item.job_id)?.title}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Date & Actions */}
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItem(item);
                                                            setEditMode('media');
                                                            setActionType('edit');
                                                        }}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="編集"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(item.public_url);
                                                            toast.success('URL Copied');
                                                        }}
                                                        className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="URLコピー"
                                                    >
                                                        <LinkIcon size={14} />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm('削除しますか？')) return;
                                                            const { error } = await supabase.from('media_library').delete().eq('id', item.id);
                                                            if (!error) {
                                                                toast.success('削除しました');
                                                                fetchMedia();
                                                            }
                                                        }}
                                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                                        title="削除"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                    // Create logic using Admin API
                    const defaultPassword = 'tempPassword123!'; // We should probably ask for password or generate one
                    // Ideally we add a password field to the modal for creation
                    // For now, we use a default temporary password and notify

                    const response = await fetch('/api/admin/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: editingItem.email,
                            password: editingItem.password || defaultPassword,
                            profile: editingItem
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'User creation failed');
                    }

                    toast.success('ユーザーを作成しました');
                    fetchUsers();
                } else {
                    // Update logic
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            full_name: editingItem.full_name,
                            user_type: editingItem.user_type,
                            first_name: editingItem.first_name,
                            last_name: editingItem.last_name,
                            phone: editingItem.phone,
                            dob: editingItem.dob,
                            gender: editingItem.gender,
                            company_name: editingItem.company_name,
                            department: editingItem.department,
                            university: editingItem.university,
                            faculty: editingItem.faculty,
                            bio: editingItem.bio,
                            tags: editingItem.tags
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
                            location: editingItem.location,
                            representative_name: editingItem.representative_name,
                            established_date: editingItem.established_date,
                            employee_count: editingItem.employee_count,
                            capital: editingItem.capital,
                            business_content: editingItem.business_content,
                            phone: editingItem.phone,
                            website_url: editingItem.website_url,
                            description: editingItem.description
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
                            description: editingItem.description,
                            salary: editingItem.salary,
                            employment_type: editingItem.employment_type,
                            working_hours: editingItem.working_hours,
                            holidays: editingItem.holidays,
                            benefits: editingItem.benefits,
                            qualifications: editingItem.qualifications,
                            access: editingItem.access,
                            content: editingItem.content
                        })
                        .eq('id', editingItem.id);
                    if (error) throw error;
                    toast.success('更新しました');
                    fetchJobs();
                }
            } else if (editMode === 'media') {
                const { error } = await supabase
                    .from('media_library')
                    .update({
                        title: editingItem.title,
                        caption: editingItem.caption,
                        link_url: editingItem.link_url,
                        link_text: editingItem.link_text,
                        organization_id: editingItem.organization_id,
                        job_id: editingItem.job_id
                    })
                    .eq('id', editingItem.id);
                if (error) throw error;
                toast.success('更新しました');
                fetchMedia();
            }
            setEditingItem(null);
        } catch (error: any) {
            console.error(error);
            let message = error.message || '保存に失敗しました';

            // Translate common errors
            if (message.includes('column') && message.includes('does not exist')) {
                message = `データベースのカラム不足です。\nSQLを実行して項目を追加してください。\n(${message})`;
            } else if (message.includes('duplicate key')) {
                message = 'データが重複しています。';
            } else if (message.includes('violates check constraint')) {
                message = 'データの形式が正しくありません (選択肢など)。';
            } else if (message.includes('permission denied')) {
                message = '権限がありません。サービスロールキー設定を確認してください。';
            }

            toast.error(message);
        }
    };

    const handleAiParse = async () => {
        if (!csvData.length || !csvTargetType) return;
        setIsAiParsing(true);
        const toastId = toast.loading('AIがデータを解析・整形中...', { duration: 30000 });

        try {
            const response = await fetch('/api/admin/parse-csv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ csvData: csvData, type: csvTargetType })
            });

            if (!response.ok) throw new Error('AI Parse failed');

            const { data } = await response.json();

            // Update data and reset headers/mapping to match perfect keys
            setCsvData(data);

            // Since keys are now perfect DB keys, we update headers to match keys
            if (data.length > 0) {
                const newHeaders = Object.keys(data[0]);
                setCsvHeaders(newHeaders);

                const newMapping: Record<string, string> = {};
                newHeaders.forEach(h => { newMapping[h] = h; });
                setCsvMapping(newMapping);
            }

            toast.dismiss(toastId);
            toast.success('AI解析が完了しました (データ整形済み)');
        } catch (error) {
            console.error(error);
            toast.dismiss(toastId);
            toast.error('AI解析に失敗しました');
        } finally {
            setIsAiParsing(false);
        }
    };

    const renderCsvModal = () => {
        let targetFields: Record<string, string> = {};
        let title = '';
        if (csvTargetType === 'company') { targetFields = COMPANY_FIELDS; title = '企業データインポート'; }
        else if (csvTargetType === 'job') { targetFields = JOB_FIELDS; title = '求人データインポート'; }
        else if (csvTargetType === 'user') { targetFields = USER_FIELDS; title = 'ユーザーデータインポート'; }
        else if (csvTargetType === 'course') { targetFields = COURSE_FIELDS; title = 'コースデータインポート'; }

        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-4xl rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-black text-slate-900">{title} - 項目マッピング</h3>
                            <button
                                onClick={handleAiParse}
                                disabled={isAiParsing}
                                className="px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-full hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-purple-200"
                            >
                                {isAiParsing ? <span className="animate-spin">⌛</span> : '✨ AI自動解析 (Beta)'}
                            </button>
                        </div>
                        <button onClick={() => setShowCsvModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold">
                                <tr>
                                    <th className="p-3 rounded-tl-xl">DB項目</th>
                                    <th className="p-3 rounded-tr-xl">CSV列</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.entries(targetFields).map(([key, label]) => (
                                    <tr key={key}>
                                        <td className="p-3 font-bold text-slate-700">{label}</td>
                                        <td className="p-3">
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-900"
                                                value={csvMapping[key] || ''}
                                                onChange={(e) => setCsvMapping({ ...csvMapping, [key]: e.target.value })}
                                            >
                                                <option value="">(スキップ)</option>
                                                {csvHeaders.map(h => (
                                                    <option key={h} value={h}>{h}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                        <h4 className="font-bold text-slate-900 mb-2">プレビュー (最初の3件)</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left whitespace-nowrap">
                                <thead className="text-slate-400 font-bold border-b border-slate-200">
                                    <tr>
                                        {Object.keys(targetFields).map(key => (
                                            <th key={key} className="p-2">{targetFields[key]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {csvData.slice(0, 3).map((row, i) => (
                                        <tr key={i}>
                                            {Object.entries(targetFields).map(([key, _]) => {
                                                const csvHeader = csvMapping[key];
                                                return <td key={key} className="p-2 text-slate-600">{csvHeader ? row[csvHeader] : '-'}</td>
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button onClick={() => setShowCsvModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">キャンセル</button>
                        <button onClick={executeCsvImport} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition-colors flex items-center gap-2">
                            インポート実行
                        </button>
                    </div>
                </div>
            </div>
        );
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
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                                {['basic', 'detail', 'activity', 'analysis'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setModalTab(tab as any)}
                                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${modalTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab === 'basic' && '基本情報'}
                                        {tab === 'detail' && '詳細情報'}
                                        {tab === 'activity' && '活動履歴'}
                                        {tab === 'analysis' && '診断・分析'}
                                    </button>
                                ))}
                            </div>

                            {modalTab === 'basic' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">姓 (Last Name)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.last_name || ''}
                                                onChange={e => setEditingItem({ ...editingItem, last_name: e.target.value, full_name: `${e.target.value} ${editingItem.first_name || ''}` })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">名 (First Name)</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.first_name || ''}
                                                onChange={e => setEditingItem({ ...editingItem, first_name: e.target.value, full_name: `${editingItem.last_name || ''} ${e.target.value}` })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">表示氏名 (Full Name)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                            value={editingItem.full_name || editingItem.name || ''}
                                            onChange={e => setEditingItem({ ...editingItem, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">メールアドレス {actionType === 'edit' && '(参照のみ)'}</label>
                                            <input
                                                type="text"
                                                className={`w-full border border-slate-200 rounded-xl px-4 py-3 font-bold ${actionType === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 text-slate-900'}`}
                                                value={editingItem.email || ''}
                                                readOnly={actionType === 'edit'}
                                                onChange={e => actionType === 'create' && setEditingItem({ ...editingItem, email: e.target.value })}
                                                placeholder="メールアドレス"
                                            />
                                        </div>
                                        {actionType === 'create' && (
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">初期パスワード</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                    value={editingItem.password || ''}
                                                    onChange={e => setEditingItem({ ...editingItem, password: e.target.value })}
                                                    placeholder="未入力の場合: tempPassword123!"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">電話番号</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.phone || ''}
                                                onChange={e => setEditingItem({ ...editingItem, phone: e.target.value })}
                                                placeholder="090-0000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">生年月日</label>
                                            <input
                                                type="date"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.dob || ''}
                                                onChange={e => setEditingItem({ ...editingItem, dob: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">年齢</label>
                                            <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-500">
                                                {editingItem.dob ? Math.floor((new Date().getTime() - new Date(editingItem.dob).getTime()) / 3.15576e10) + '歳' : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">性別</label>
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.gender || 'unspecified'}
                                                onChange={e => setEditingItem({ ...editingItem, gender: e.target.value })}
                                            >
                                                <option value="male">男性</option>
                                                <option value="female">女性</option>
                                                <option value="other">その他</option>
                                                <option value="unspecified">未指定</option>
                                            </select>
                                        </div>
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
                                </div>
                            )}

                            {modalTab === 'detail' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">会社名</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.company_name || ''}
                                                onChange={e => setEditingItem({ ...editingItem, company_name: e.target.value })}
                                                placeholder="会社名（社会人の場合）"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">部署・所属</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.department || ''}
                                                onChange={e => setEditingItem({ ...editingItem, department: e.target.value })}
                                                placeholder="部署名"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">大学・所属</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.university || ''}
                                                onChange={e => setEditingItem({ ...editingItem, university: e.target.value })}
                                                placeholder="例：愛媛大学"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">学部・部署</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                                value={editingItem.faculty || ''}
                                                onChange={e => setEditingItem({ ...editingItem, faculty: e.target.value })}
                                                placeholder="例：法文学部"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">自己紹介 (Bio)</label>
                                        <textarea
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[100px]"
                                            value={editingItem.bio || ''}
                                            onChange={e => setEditingItem({ ...editingItem, bio: e.target.value })}
                                            placeholder="自己紹介文..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">タグ</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                            value={Array.isArray(editingItem.tags) ? editingItem.tags.join(',') : (editingItem.tags || '')}
                                            onChange={e => setEditingItem({ ...editingItem, tags: e.target.value.split(',') })}
                                            placeholder="カンマ区切り"
                                        />
                                    </div>
                                </div>
                            )}

                            {modalTab === 'activity' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-2">eラーニング受講履歴</h4>
                                        <div className="bg-slate-50 rounded-xl p-4 min-h-[50px] text-xs">
                                            {relatedData.courses?.length > 0 ? (
                                                relatedData.courses.map((c: any) => (
                                                    <div key={c.id} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                                        <span>{c.courses?.title || 'Unknown Course'}</span>
                                                        <span className={c.status === 'completed' ? 'text-green-600 font-bold' : 'text-slate-500'}>{c.status}</span>
                                                    </div>
                                                ))
                                            ) : <div className="text-slate-400">履歴なし</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-2">求人応募履歴</h4>
                                        <div className="bg-slate-50 rounded-xl p-4 min-h-[50px] text-xs">
                                            {relatedData.applications?.length > 0 ? (
                                                relatedData.applications.map((app: any) => (
                                                    <div key={app.id} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                                        <span>{app.jobs?.title || 'Unknown Job'}</span>
                                                        <span className="font-bold text-blue-600">{app.status}</span>
                                                    </div>
                                                ))
                                            ) : <div className="text-slate-400">応募履歴なし</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-2">気になるリスト (Saved)</h4>
                                        <div className="bg-slate-50 rounded-xl p-4 min-h-[50px] text-xs">
                                            {relatedData.bookmarks?.length > 0 ? (
                                                relatedData.bookmarks.map((b: any) => (
                                                    <div key={b.id} className="py-1 border-b border-slate-100 last:border-0">
                                                        {b.item_type}: {b.item_id}
                                                    </div>
                                                ))
                                            ) : <div className="text-slate-400">保存アイテムなし</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 mb-2">閲覧履歴 (Views)</h4>
                                        <div className="bg-slate-50 rounded-xl p-4 min-h-[50px] text-xs max-h-[150px] overflow-y-auto">
                                            {relatedData.logs?.length > 0 ? (
                                                relatedData.logs.map((log: any) => (
                                                    <div key={log.id} className="flex justify-between py-1 border-b border-slate-100 last:border-0">
                                                        <span>{log.item_type} viewed</span>
                                                        <span className="text-slate-400">{new Date(log.viewed_at).toLocaleDateString()}</span>
                                                    </div>
                                                ))
                                            ) : <div className="text-slate-400">履歴なし</div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'analysis' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-xl">
                                        <h4 className="font-black text-slate-900 mb-2">診断結果 (JSON)</h4>
                                        <pre className="text-xs text-slate-600 overflow-x-auto">
                                            {JSON.stringify(editingItem.diagnosis_result || {}, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="text-center p-4">
                                        <p className="text-xs text-slate-400">※ 占い結果や詳細診断は実装に合わせてここに表示されます</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {editMode === 'media' && (
                        <>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">タイトル</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.title || editingItem.filename || ''}
                                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                    placeholder="動画のタイトル"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">キャプション / 説明</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[80px]"
                                    value={editingItem.caption || ''}
                                    onChange={e => setEditingItem({ ...editingItem, caption: e.target.value })}
                                    placeholder="動画の説明文やキャプション..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ボタン/リンク URL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.link_url || ''}
                                        onChange={e => setEditingItem({ ...editingItem, link_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">ボタンテキスト</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.link_text || ''}
                                        onChange={e => setEditingItem({ ...editingItem, link_text: e.target.value })}
                                        placeholder="詳細を見る"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">関連企業</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.organization_id || ''}
                                        onChange={e => setEditingItem({ ...editingItem, organization_id: e.target.value })}
                                    >
                                        <option value="">(未選択)</option>
                                        {realCompanies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">関連求人</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.job_id || ''}
                                        onChange={e => setEditingItem({ ...editingItem, job_id: e.target.value })}
                                    >
                                        <option value="">(未選択)</option>
                                        {realJobs.map(j => (
                                            <option key={j.id} value={j.id}>{j.title}</option>
                                        ))}
                                    </select>
                                </div>
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
                            <div className="grid grid-cols-2 gap-4">
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">代表者名</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.representative_name || ''}
                                        onChange={e => setEditingItem({ ...editingItem, representative_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">設立日</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.established_date || ''}
                                        onChange={e => setEditingItem({ ...editingItem, established_date: e.target.value })}
                                        placeholder="例: 2000年4月1日"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">従業員数</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.employee_count || ''}
                                        onChange={e => setEditingItem({ ...editingItem, employee_count: e.target.value })}
                                        placeholder="例: 100名"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">資本金</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.capital || ''}
                                        onChange={e => setEditingItem({ ...editingItem, capital: e.target.value })}
                                        placeholder="例: 1000万円"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">電話番号</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.phone || ''}
                                        onChange={e => setEditingItem({ ...editingItem, phone: e.target.value })}
                                        placeholder="089-000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">WebサイトURL</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.website_url || ''}
                                        onChange={e => setEditingItem({ ...editingItem, website_url: e.target.value })}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">事業内容</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[80px]"
                                    value={editingItem.business_content || ''}
                                    onChange={e => setEditingItem({ ...editingItem, business_content: e.target.value })}
                                    placeholder="事業内容の概要..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">説明文 (詳細)</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[100px]"
                                    value={editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
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
                            <div className="grid grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">企業 (Organization)</label>
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.organization_id || editingItem.company_id || ''}
                                        onChange={e => setEditingItem({ ...editingItem, organization_id: e.target.value, company_id: e.target.value })}
                                    >
                                        <option value="">企業を選択...</option>
                                        {realCompanies.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">詳細内容 (Content)</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[150px]"
                                    value={editingItem.content || editingItem.description || ''}
                                    onChange={e => setEditingItem({ ...editingItem, content: e.target.value, description: e.target.value })}
                                    placeholder="求人の詳細内容..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">給与</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.salary || ''}
                                        onChange={e => setEditingItem({ ...editingItem, salary: e.target.value })}
                                        placeholder="例: 月給 25万円〜"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">雇用形態</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.employment_type || ''}
                                        onChange={e => setEditingItem({ ...editingItem, employment_type: e.target.value })}
                                        placeholder="例: 正社員"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">勤務時間</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.working_hours || ''}
                                        onChange={e => setEditingItem({ ...editingItem, working_hours: e.target.value })}
                                        placeholder="例: 9:00 - 18:00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">休日</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                        value={editingItem.holidays || ''}
                                        onChange={e => setEditingItem({ ...editingItem, holidays: e.target.value })}
                                        placeholder="例: 土日祝"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">福利厚生</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[60px]"
                                    value={editingItem.benefits || ''}
                                    onChange={e => setEditingItem({ ...editingItem, benefits: e.target.value })}
                                    placeholder="福利厚生..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">応募条件</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[60px]"
                                    value={editingItem.qualifications || ''}
                                    onChange={e => setEditingItem({ ...editingItem, qualifications: e.target.value })}
                                    placeholder="必要な資格や経験..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-2">アクセス</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.access || ''}
                                    onChange={e => setEditingItem({ ...editingItem, access: e.target.value })}
                                    placeholder="アクセス..."
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
                {showMediaModal && renderMediaModal()}
                {showCsvModal && renderCsvModal()}
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
