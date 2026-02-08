"use client";

import React, { useState, Suspense } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Building2, Briefcase, GraduationCap, Users,
    Search, Edit3, Trash2, Eye, X, CheckSquare, Square,
    Plus, ChevronLeft, ChevronRight, Upload, Video, FileVideo, Save, ArrowRight, ExternalLink, Zap, Link as LinkIcon, Sparkles, RefreshCcw
} from 'lucide-react';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { ImageUpload } from '@/components/ImageUpload';
import { ReelIcon } from '@/components/reels/ReelIcon';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
// import { COMPANIES, JOBS } from '@/lib/dummyData'; // Removed
import {
    fetchAdminCompaniesAction,
    fetchAdminJobsAction,
    fetchAdminMediaAction,
    updateMediaAction,
    updateOrganizationVisibilityAction,
    updateJobVisibilityAction,
    updateJobHiringStatusAction
} from '../actions';

const supabaseClient = createClient();

function AdminManagementContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'company_infos';
    const {
        companies, jobs, activeRole, courses, users,
        fetchCourses, addCourses, updateCourse, deleteCourse
    } = useAppStore();
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
    const [editMode, setEditMode] = useState<'company' | 'job' | 'user' | 'media' | 'course' | null>(null);
    const [actionType, setActionType] = useState<'create' | 'edit'>('edit');
    const [modalTab, setModalTab] = useState<'basic' | 'detail' | 'activity' | 'analysis'>('basic');
    const [relatedData, setRelatedData] = useState<any>({ applications: [], logs: [], bookmarks: [], courses: [] });
    const [pendingVideos, setPendingVideos] = useState<{ type: 'file' | 'youtube', file?: File, url?: string, title: string }[]>([]);

    const usersFileInputRef = React.useRef<HTMLInputElement>(null);
    const companiesFileInputRef = React.useRef<HTMLInputElement>(null);
    const jobsFileInputRef = React.useRef<HTMLInputElement>(null);

    const supabase = supabaseClient;

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [importSource, setImportSource] = useState<'url' | 'pdf'>('url');
    const [aiUrl, setAiUrl] = useState('');
    const [fileData, setFileData] = useState<{ base64: string, mimeType: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const base64Content = base64String.split(',')[1];
            setFileData({
                base64: base64Content,
                mimeType: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const handleCompanyAiAutoFill = async () => {
        if (!aiUrl && !editingItem.business_content) {
            toast.error('URLまたは会社説明を入力してください');
            return;
        }

        setIsAiLoading(true);
        try {
            const response = await fetch('/api/ai/company-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: aiUrl || editingItem.business_content })
            });

            if (!response.ok) throw new Error('Generation failed');
            const profile = await response.json();

            setEditingItem((prev: any) => ({
                ...prev,
                ...profile,
                name: profile.name || prev.name,
                industry: profile.industry || prev.industry,
                location: profile.location || prev.location,
                business_content: profile.businessDetails || profile.description || prev.business_content,
            }));

            toast.success('AIが企業情報を自動生成しました！');
        } catch (error) {
            console.error(error);
            toast.error('情報の生成に失敗しました');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleJobAiAutoFill = async () => {
        if (importSource === 'url' && !aiUrl) {
            toast.error('URLを入力してください');
            return;
        }
        if (importSource === 'pdf' && !fileData) {
            toast.error('ファイルをアップロードしてください');
            return;
        }

        setIsAiLoading(true);
        try {
            const payload = importSource === 'url'
                ? { input: aiUrl }
                : { base64Data: fileData?.base64, mimeType: fileData?.mimeType };

            const response = await fetch('/api/ai/job-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Generation failed');
            const data = await response.json();

            setEditingItem((prev: any) => ({
                ...prev,
                ...data,
                description: data.description || prev.description,
                content: data.description || prev.content,
            }));

            toast.success('求人情報を生成しました！');
        } catch (error) {
            console.error(error);
            toast.error('生成に失敗しました');
        } finally {
            setIsAiLoading(false);
        }
    };

    React.useEffect(() => {
        console.log('AdminManagementContent: currentTab changed to:', currentTab);
        setSelectedIds(new Set()); // Clear selection on tab change
        setFilterPremium(false); // Reset premium filter
        if (currentTab === 'media') {
            fetchMedia();
            fetchCompanies();
            fetchJobs();
        } else if (currentTab === 'company_infos') {
            fetchCompanies();
            fetchMedia();
        } else if (currentTab === 'jobs' || currentTab === 'quests') {
            fetchJobs();
            fetchCompanies();
            fetchMedia(); // Fetch media for video column
        }
    }, [currentTab]);

    React.useEffect(() => {
        console.log('State Monitor:', {
            realUsersCount: realUsers.length,
            realCompaniesCount: realCompanies.length,
            realJobsCount: realJobs.length,
            mediaItemsCount: mediaItems.length
        });
    }, [realUsers, realCompanies, realJobs, mediaItems]);



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
        console.log('fetchCompanies: starting...');
        const result = await fetchAdminCompaniesAction();
        if (!result.success) {
            console.error('fetchCompanies: FAILED', result.error);
            toast.error('企業の取得に失敗しました');
            // ONLY fallback if absolutely no data and it's a critical error
            if (realCompanies.length === 0) {
                // setRealCompanies(COMPANIES.map(c => ({ ...c, logo_url: c.image, type: 'company', status: 'approved' })) || []);
                setRealCompanies([]);
            }
        } else {
            console.log('fetchCompanies: SUCCESS, count:', result.data?.length);
            setRealCompanies(result.data || []);
        }
    };

    const fetchJobs = async () => {
        console.log('fetchJobs: starting...');
        const result = await fetchAdminJobsAction();
        if (!result.success) {
            console.error('fetchJobs: FAILED', result.error);
            toast.error('求人の取得に失敗しました');
            if (realJobs.length === 0) {
                // setRealJobs(JOBS.map(j => ({ ...j, organization_id: j.companyId, status: 'active' })) || []);
                setRealJobs([]);
            }
        } else {
            console.log('fetchJobs: SUCCESS, count:', result.data?.length);
            setRealJobs(result.data || []);
        }
    };

    const fetchMedia = async () => {
        const result = await fetchAdminMediaAction();

        if (!result.success) {
            console.warn('Fetch Media failed, using fallback');
            // Extract Reels from Dummy Companies
            setMediaItems([]);
            // const dummyMedia = COMPANIES.flatMap(c =>
            //     (c.reels || []).map(r => ({
            //         id: r.id,
            //         public_url: r.url,
            //         thumbnail_url: r.thumbnail || r.url,
            //         filename: r.title,
            //         type: r.type,
            //         organization_id: c.id
            //     }))
            // );
            // setMediaItems(dummyMedia);
        } else {
            setMediaItems(result.data || []);
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
    const [mediaParentId, setMediaParentId] = useState(''); // Selected company for hierarchical job/quest link
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [isAiParsing, setIsAiParsing] = useState(false);
    const [associationType, setAssociationType] = useState<'company' | 'job' | 'quest' | null>(null);
    const [filterPremium, setFilterPremium] = useState(false);

    const editingItemIdRef = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (editingItem && editMode === 'media') {
            // Only sync type from data when we switch to a NEW item
            if (editingItem.id !== editingItemIdRef.current) {
                editingItemIdRef.current = editingItem.id;

                if (editingItem.organization_id) {
                    setAssociationType('company');
                } else if (editingItem.job_id) {
                    const linkedJob = realJobs.find(j => j.id === editingItem.job_id);
                    if (linkedJob && linkedJob.type === 'quest') {
                        setAssociationType('quest');
                    } else {
                        setAssociationType('job');
                    }
                } else {
                    setAssociationType(null);
                }
            }
            // If item ID is same, we assume user is manually changing types, so don't interfere.
        }
    }, [editingItem, editMode, realJobs]);


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



    const renderCompanyInfos = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">企業情報一覧</h2>
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
                        <Upload size={18} /> CSV一括登録
                    </button>
                    <button
                        onClick={() => { setEditingItem({}); setEditMode('company'); setActionType('create'); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all"
                    >
                        <Plus size={18} /> 情報追加
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
                <button
                    onClick={() => setFilterPremium(!filterPremium)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${filterPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    <Zap size={16} className={filterPremium ? 'fill-amber-700' : ''} />
                    {filterPremium ? 'プレミアムのみ' : '全て表示'}
                </button>
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
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 flex-shrink-0 mr-2" />
                                    <span>業界 / 所在地</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">公開設定</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">編集</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {realCompanies
                            .filter(c => (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase()))
                            .filter(c => !filterPremium || c.is_premium)
                            .sort((a, b) => (b.is_premium === a.is_premium ? 0 : b.is_premium ? 1 : -1))
                            .map(company => (
                                <tr key={company.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(company.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelection(company.id)}>
                                            {selectedIds.has(company.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={company.logo_url || company.cover_image_url || company.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                            <span className="font-black text-slate-800">{company.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Reel Icon Injected Here */}
                                            <div className="flex-shrink-0 w-12 flex justify-center mr-2">
                                                {mediaItems.filter(m => m.organization_id === company.id).length > 0 ? (
                                                    <ReelIcon
                                                        reels={mediaItems.filter(m => m.organization_id === company.id).map(m => ({
                                                            id: m.id,
                                                            type: m.type || 'file',
                                                            url: m.public_url,
                                                            thumbnail: m.thumbnail_url || m.public_url,
                                                            title: m.filename,
                                                            likes: 0
                                                        }))}
                                                        size="sm"
                                                        className="mr-0"
                                                        onClick={() => {
                                                            const reels = mediaItems.filter(m => m.organization_id === company.id);
                                                            if (reels.length > 0) {
                                                                window.open(reels[0].public_url, '_blank');
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-xs">{company.industry}</div>
                                                <div className="text-[10px] font-bold text-slate-400">{company.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={async () => {
                                                const res = await updateOrganizationVisibilityAction(company.id, !company.is_public);
                                                if (res.success) {
                                                    toast.success('公開設定を更新しました');
                                                    fetchCompanies();
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${!company.is_public
                                                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {!company.is_public ? '非公開' : '公開中'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setEditingItem(company); setEditMode('company'); setActionType('edit'); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
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

    const renderJobs = (typeFilter: 'job' | 'quest' = 'job') => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">{typeFilter === 'quest' ? 'クエスト管理' : '求人管理'}</h2>
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
                        className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                        <Upload size={18} /> CSV登録
                    </button>
                    <button className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all cursor-pointer">一括公開停止</button>
                    <button
                        onClick={() => {
                            setEditingItem({ type: typeFilter });
                            setEditMode('job');
                            setActionType('create');
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all cursor-pointer"
                    >
                        <Plus size={18} /> 新規追加
                    </button>
                </div>
            </div>
            <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                    type="text"
                    placeholder={`${typeFilter === 'quest' ? 'クエスト' : '求人'}タイトルまたは企業名で検索...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 text-sm placeholder:text-slate-400"
                />
                <button
                    onClick={() => setFilterPremium(!filterPremium)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${filterPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                    <Zap size={16} className={filterPremium ? 'fill-amber-700' : ''} />
                    {filterPremium ? 'プレミアムのみ' : '全て表示'}
                </button>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <button onClick={() => toggleAll(realJobs.filter(j => j.type === typeFilter).map(j => j.id))}>
                                    {selectedIds.size === realJobs.filter(j => j.type === typeFilter).length && realJobs.filter(j => j.type === typeFilter).length > 0 ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{typeFilter === 'quest' ? 'クエストタイトル' : '求人タイトル'}</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 flex-shrink-0 mr-2" />
                                    <span>タイプ</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">企業</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">ステータス</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">公開設定</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                        {realJobs.filter(j => (j.type === typeFilter || (!j.type && typeFilter === 'job'))).length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                    データが見つかりません
                                </td>
                            </tr>
                        )}
                        {realJobs
                            .filter(j => (j.type === typeFilter || (!j.type && typeFilter === 'job')))
                            .filter(j =>
                                (j.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (realCompanies.find(c => c.id === j.organization_id)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .filter(j => !filterPremium || realCompanies.find(c => c.id === j.organization_id)?.is_premium)
                            .sort((a, b) => {
                                const isPremA = realCompanies.find(c => c.id === a.organization_id)?.is_premium;
                                const isPremB = realCompanies.find(c => c.id === b.organization_id)?.is_premium;
                                return (isPremA === isPremB) ? 0 : isPremA ? -1 : 1;
                            })
                            .map(job => (
                                <tr key={job.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(job.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelection(job.id)}>
                                            {selectedIds.has(job.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} className="text-slate-300" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Moved Video Icon from here */}
                                            <img
                                                src={job.cover_image_url || job.cover_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop'}
                                                className="w-10 h-10 rounded-xl object-cover"
                                                alt=""
                                            />
                                            <span className="font-black text-slate-800">{job.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Video Icon Container - Fixed Width for Alignment */}
                                            <div className="flex-shrink-0 w-12 flex justify-center mr-2">
                                                {mediaItems.filter(m => m.job_id === job.id).length > 0 ? (
                                                    <ReelIcon
                                                        reels={mediaItems.filter(m => m.job_id === job.id).map(m => ({
                                                            id: m.id,
                                                            type: m.type || 'file',
                                                            url: m.public_url,
                                                            thumbnail: m.thumbnail_url || m.public_url,
                                                            title: m.filename,
                                                            likes: 0
                                                        }))}
                                                        size="sm"
                                                        className="mr-0"
                                                        onClick={() => {
                                                            const reels = mediaItems.filter(m => m.job_id === job.id);
                                                            if (reels.length > 0) {
                                                                window.open(reels[0].public_url, '_blank');
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10" />
                                                )}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${job.type === 'quest' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {(job.type || 'job').toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{realCompanies.find(c => c.id === job.organization_id)?.name || job.organization_id}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={async () => {
                                                const newStatus = job.hiring_status === 'open' ? 'closed' : 'open';
                                                const res = await updateJobHiringStatusAction(job.id, newStatus);
                                                if (res.success) {
                                                    toast.success('募集ステータスを更新しました');
                                                    fetchJobs();
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${job.hiring_status === 'closed'
                                                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {job.hiring_status === 'closed' ? '受付終了' : '募集中'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={async () => {
                                                const res = await updateJobVisibilityAction(job.id, !job.is_public);
                                                if (res.success) {
                                                    toast.success('公開設定を更新しました');
                                                    fetchJobs();
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all ${!job.is_public
                                                ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                                                }`}
                                        >
                                            {!job.is_public ? '非公開' : '公開中'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button
                                                onClick={() => {
                                                    console.log('Editing job:', job);
                                                    setEditingItem(job);
                                                    setEditMode('job');
                                                    setActionType('edit');
                                                }}
                                                className="p-2 hover:text-blue-600 cursor-pointer"
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
                        className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                        <Upload size={18} /> CSVから一括登録
                    </button>
                    <button
                        onClick={() => { setEditingItem({}); setEditMode('course'); setActionType('create'); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all cursor-pointer"
                    >
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
                    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || (c.category || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(course => (
                        <div key={course.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-4">
                            <img
                                src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop'}
                                className="w-24 h-24 rounded-3xl object-cover"
                                alt=""
                                onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop';
                                }}
                            />
                            <div className="flex-1">
                                <h3 className="font-black text-slate-800 leading-tight">{course.title}</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">{course.category} | {course.level}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <button
                                        onClick={() => { setEditingItem(course); setEditMode('course'); setActionType('edit'); }}
                                        className="text-xs font-black text-blue-600 flex items-center gap-1 hover:underline cursor-pointer"
                                    >
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
            if ((linkTargetType === 'job' || linkTargetType === 'quest') && linkTargetId) {
                item.job_id = linkTargetId;
                if (mediaParentId) item.organization_id = mediaParentId;
            }

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="font-black text-xl text-slate-900">新規動画追加</h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">動画ファイルをアップロードするか、YouTube URLを入力してください</p>
                    </div>
                    <button onClick={() => setShowMediaModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
                    {/* Media Info Section */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">動画ソース</label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button
                                    onClick={() => setVideoLinkType('file')}
                                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${videoLinkType === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    ファイル
                                </button>
                                <button
                                    onClick={() => setVideoLinkType('youtube')}
                                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${videoLinkType === 'youtube' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    YouTube
                                </button>
                            </div>

                            {videoLinkType === 'file' ? (
                                <div className="space-y-2">
                                    <input type="file" accept="video/*" ref={videoInputRef} className="hidden" onChange={() => { }} />
                                    <button
                                        onClick={() => videoInputRef.current?.click()}
                                        className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/50 transition-all group cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <Upload size={24} className="text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                        <span className="text-xs font-black text-slate-400 group-hover:text-blue-600">動画ファイルを選択</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="https://youtube.com/..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-sm"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">タイトル</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-sm"
                                    value={editingItem?.title || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                    placeholder="動画のタイトル"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 pl-1">キャプション</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-sm text-slate-900 min-h-[100px] focus:bg-white focus:border-blue-500 outline-none transition-all shadow-sm"
                                    value={editingItem?.caption || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                                    placeholder="動画の内容を説明してください..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Picker Section */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                            <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">1. 関連：</span>
                            <div className="flex gap-2">
                                {(['none', 'company', 'job', 'quest'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setLinkTargetType(type);
                                            setLinkTargetId('');
                                            setMediaParentId('');
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 whitespace-nowrap cursor-pointer ${linkTargetType === type ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-400 hover:border-blue-200'}`}
                                    >
                                        {type === 'none' && 'なし'}
                                        {type === 'company' && '企業'}
                                        {type === 'job' && '求人'}
                                        {type === 'quest' && 'クエスト'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {linkTargetType !== 'none' && (
                            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none animate-in fade-in slide-in-from-bottom-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">2. コンテンツ：</span>
                                <div className="flex gap-2">
                                    {linkTargetType === 'company' && realCompanies.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setLinkTargetId(c.id)}
                                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap cursor-pointer ${linkTargetId === c.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                    {(linkTargetType === 'job' || linkTargetType === 'quest') && (
                                        <div className="flex gap-4 items-center">
                                            {/* For Job/Quest, we might still need company first or just show all. 
                                                User said: "関連が求人なら求人リストを出したい". We try direct list. */}
                                            {realJobs
                                                .filter(j => linkTargetType === 'job' ? j.type !== 'quest' : j.type === 'quest')
                                                .map(j => (
                                                    <button
                                                        key={j.id}
                                                        onClick={() => setLinkTargetId(j.id)}
                                                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 whitespace-nowrap cursor-pointer ${linkTargetId === j.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}
                                                    >
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-[8px] opacity-50 uppercase">{realCompanies.find(c => c.id === j.organization_id)?.name}</span>
                                                            {j.title}
                                                        </div>
                                                    </button>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={() => setShowMediaModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-white rounded-xl transition-all cursor-pointer">キャンセル</button>
                        <button
                            onClick={handleMediaSubmit}
                            disabled={uploading}
                            className="bg-blue-600 text-white px-10 py-3 rounded-[1.25rem] font-black text-sm flex items-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-100 cursor-pointer"
                        >
                            {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
                            ビデオを保存
                        </button>
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mediaItems.map((item) => (
                            <div key={item.id} className="group bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200 transition-all duration-300">
                                <div className="aspect-video bg-black relative">
                                    {item.type === 'youtube' ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${getYouTubeID(item.public_url)}`}
                                            title="YouTube"
                                            frameBorder="0"
                                            className="pointer-events-none"
                                        />
                                    ) : (
                                        <video src={item.public_url} className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {item.type === 'youtube' && <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase">YouTube</span>}
                                        {!item.organization_id && !item.job_id && <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase">Reels</span>}
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                const asType = item.organization_id ? 'company' :
                                                    item.job_id ? (realJobs.find(j => j.id === item.job_id)?.type === 'quest' ? 'quest' : 'job') : null;
                                                setAssociationType(asType);
                                                setEditingItem(item);
                                                setEditMode('media');
                                                setActionType('edit');
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-blue-600 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer"
                                        >
                                            <Edit3 size={16} />
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
                                            className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-red-600 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-900 text-sm line-clamp-1">{item.title || item.filename || 'No Title'}</h4>
                                        <p className="text-[10px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.organization_id && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600">
                                                <Building2 size={8} /> {realCompanies.find(c => c.id === item.organization_id)?.name || '企業あり'}
                                            </span>
                                        )}
                                        {item.job_id && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg text-blue-600">
                                                <Briefcase size={8} /> {realJobs.find(j => j.id === item.job_id)?.title || '求人あり'}
                                            </span>
                                        )}
                                        {item.link_url && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-black bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-lg text-purple-600">
                                                <ExternalLink size={8} /> リンクあり
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );


    const handleSaveEdit = async () => {
        console.log('handleSaveEdit called!', { editMode, actionType, editingItem });
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
                            tags: editingItem.tags,
                            avatar_url: editingItem.avatar_url
                        })
                        .eq('id', editingItem.id);
                    if (error) throw error;
                    toast.success('更新しました');
                }
            } else if (editMode === 'company') {
                if (actionType === 'create') {
                    const { data, error } = await supabase.from('organizations').insert([{ ...editingItem, type: 'company', status: 'approved' }]).select();
                    if (error) throw error;
                    if (data && data[0]) {
                        await processPendingVideos(data[0].id, 'company');
                    }
                    toast.success('企業を作成しました');
                    fetchCompanies();
                } else {
                    console.log('Saving company with data:', {
                        logo_url: editingItem.logo_url,
                        cover_image_url: editingItem.cover_image_url,
                        full_editingItem: editingItem
                    });
                    const { error } = await supabase
                        .from('organizations')
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
                            description: editingItem.description,
                            logo_url: editingItem.logo_url,
                            cover_image_url: editingItem.cover_image_url,
                            is_premium: editingItem.is_premium,
                            user_id: editingItem.user_id // 紐付け更新
                        })
                        .eq('id', editingItem.id);
                    if (error) {
                        console.error('Save error:', error);
                        throw error;
                    }
                    await processPendingVideos(editingItem.id, 'company');
                    console.log('Save successful!');
                    toast.success('更新しました');
                    fetchCompanies();
                }
            } else if (editMode === 'job') {
                if (actionType === 'create') {
                    const { data, error } = await supabase.from('jobs').insert([{ ...editingItem, is_active: true }]).select();
                    if (error) throw error;
                    if (data && data[0]) {
                        await processPendingVideos(data[0].id, 'job');
                    }
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
                            content: editingItem.content,
                            cover_image: editingItem.cover_image_url || editingItem.cover_image
                        })
                        .eq('id', editingItem.id);
                    if (error) throw error;
                    await processPendingVideos(editingItem.id, 'job');
                    toast.success('更新しました');
                    fetchJobs();
                }
            } else if (editMode === 'media') {
                const result = await updateMediaAction({
                    id: editingItem.id,
                    title: editingItem.title,
                    caption: editingItem.caption,
                    link_url: editingItem.link_url,
                    link_text: editingItem.link_text,
                    organization_id: editingItem.organization_id,
                    job_id: editingItem.job_id
                });

                if (!result.success) throw new Error(result.error);
                toast.success('更新しました');
                fetchMedia();
            } else if (editMode === 'course') {
                if (actionType === 'create') {
                    await addCourses([editingItem]);
                } else {
                    await updateCourse(editingItem);
                }
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



    const renderCourseEdit = () => (
        <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">コースタイトル</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 shadow-sm focus:border-blue-500 outline-none transition-all"
                            value={editingItem.title || ''}
                            onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                            placeholder="コース名を入力..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">カテゴリ</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 shadow-sm focus:border-blue-500 outline-none transition-all"
                                value={editingItem.category || ''}
                                onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                                placeholder="例: ITスキル"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">難易度</label>
                            <select
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 shadow-sm focus:border-blue-500 outline-none transition-all"
                                value={editingItem.level || '初級'}
                                onChange={e => setEditingItem({ ...editingItem, level: e.target.value })}
                            >
                                <option>初級</option>
                                <option>中級</option>
                                <option>上級</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <ImageUpload
                        currentImageUrl={editingItem.image}
                        onImageUploaded={(url) => setEditingItem({ ...editingItem, image: url })}
                        label="サムネイル画像"
                        folder="courses"
                    />
                    <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">コース説明</label>
                        <textarea
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-900 shadow-sm focus:border-blue-500 outline-none transition-all min-h-[50px]"
                            value={editingItem.description || ''}
                            onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                            placeholder="コースの概要説明..."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-slate-900">カリキュラム構成 (章・レッスン)</h4>
                    <button
                        onClick={() => {
                            const newCurrs = [...(editingItem.curriculums || [])];
                            newCurrs.push({ id: Math.random().toString(36).substr(2, 9), title: '新章', lessons: [] });
                            setEditingItem({ ...editingItem, curriculums: newCurrs });
                        }}
                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
                    >
                        <Plus size={14} /> 章を追加
                    </button>
                </div>

                <div className="space-y-6">
                    {(editingItem.curriculums || []).map((curr: any, currIdx: number) => (
                        <div key={curr.id} className="bg-white border-2 border-slate-100 rounded-[2rem] overflow-hidden">
                            <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-1 rounded-lg">章 {currIdx + 1}</span>
                                    <input
                                        type="text"
                                        className="bg-transparent border-none outline-none font-black text-slate-800 text-lg flex-1"
                                        value={curr.title || ''}
                                        onChange={e => {
                                            const newCurrs = [...editingItem.curriculums];
                                            newCurrs[currIdx].title = e.target.value;
                                            setEditingItem({ ...editingItem, curriculums: newCurrs });
                                        }}
                                        placeholder="章のタイトル..."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newCurrs = [...editingItem.curriculums];
                                            newCurrs[currIdx].lessons.push({
                                                id: Math.random().toString(36).substr(2, 9),
                                                title: '新規レッスン',
                                                duration: '5:00',
                                                video_url: ''
                                            });
                                            setEditingItem({ ...editingItem, curriculums: newCurrs });
                                        }}
                                        className="text-blue-600 text-xs font-black flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
                                    >
                                        <Plus size={14} /> レッスン追加
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newCurrs = editingItem.curriculums.filter((_: any, i: number) => i !== currIdx);
                                            setEditingItem({ ...editingItem, curriculums: newCurrs });
                                        }}
                                        className="text-red-400 hover:text-red-600 p-1.5 cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {curr.lessons.length === 0 ? (
                                    <div className="text-center py-4 text-xs font-bold text-slate-300">レッスンがありません。追加してください。</div>
                                ) : (
                                    curr.lessons.map((lesson: any, lessonIdx: number) => (
                                        <div key={lesson.id} className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4 border border-transparent hover:border-slate-200 transition-all">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">{lessonIdx + 1}</span>
                                                    <input
                                                        type="text"
                                                        className="bg-transparent border-none outline-none font-black text-slate-700 text-sm flex-1"
                                                        value={lesson.title || ''}
                                                        onChange={e => {
                                                            const newCurrs = [...editingItem.curriculums];
                                                            newCurrs[currIdx].lessons[lessonIdx].title = e.target.value;
                                                            setEditingItem({ ...editingItem, curriculums: newCurrs });
                                                        }}
                                                        placeholder="レッスンのタイトル..."
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                                                        <Video size={12} className="text-slate-400" />
                                                        <input
                                                            type="text"
                                                            className="bg-transparent border-none outline-none font-bold text-[10px] text-slate-600 w-16 text-center"
                                                            value={lesson.duration || ''}
                                                            onChange={e => {
                                                                const newCurrs = [...editingItem.curriculums];
                                                                newCurrs[currIdx].lessons[lessonIdx].duration = e.target.value;
                                                                setEditingItem({ ...editingItem, curriculums: newCurrs });
                                                            }}
                                                            placeholder="5:00"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newCurrs = [...editingItem.curriculums];
                                                            newCurrs[currIdx].lessons = newCurrs[currIdx].lessons.filter((_: any, i: number) => i !== lessonIdx);
                                                            setEditingItem({ ...editingItem, curriculums: newCurrs });
                                                        }}
                                                        className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100">
                                                <LinkIcon size={14} className="text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none outline-none font-bold text-[10px] text-slate-500 flex-1"
                                                    value={lesson.video_url || ''}
                                                    onChange={e => {
                                                        const newCurrs = [...editingItem.curriculums];
                                                        newCurrs[currIdx].lessons[lessonIdx].video_url = e.target.value;
                                                        setEditingItem({ ...editingItem, curriculums: newCurrs });
                                                        // Also update the public_url of the editingItem if it's a media item being edited
                                                        // This part is tricky as editingItem is a course, not a media item directly.
                                                        // If a lesson's video_url is being edited, it's part of the course structure.
                                                        // No direct public_url update on editingItem itself is needed here.
                                                    }}
                                                    placeholder="YouTube動画URL (例: https://www.youtube.com/watch?v=...)"
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const handleStatusToggle = async (id: string, type: 'company' | 'job', currentStatus: any) => {
        const table = type === 'company' ? 'organizations' : 'jobs';
        let updateData = {};

        if (type === 'job') {
            // Jobs use is_active (boolean)
            updateData = { is_active: !currentStatus };
        } else {
            // Companies use status (text)
            const newStatus = currentStatus === 'approved' ? 'private' : 'approved';
            updateData = { status: newStatus };
        }

        try {
            const { error } = await supabase.from(table).update(updateData).eq('id', id);

            if (error) throw error;

            toast.success(`${type === 'company' ? '企業' : '求人'}のステータスを更新しました`);

            // Refresh data
            if (type === 'company') fetchCompanies();
            else fetchJobs();

        } catch (e) {
            console.error(e);
            toast.error('ステータスの更新に失敗しました');
        }
    };

    const processPendingVideos = async (parentId: string, parentType: 'company' | 'job') => {
        if (pendingVideos.length === 0) return;

        const toastId = toast.loading('動画を保存中...');
        try {
            for (const v of pendingVideos) {
                let publicUrl = '';
                let storageFilePath = '';

                if (v.type === 'file' && v.file) {
                    const fileExt = v.file.name.split('.').pop();
                    storageFilePath = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const { error: upErr } = await supabase.storage.from('videos').upload(storageFilePath, v.file);
                    if (upErr) {
                        console.error('Failed to upload video', v.title, upErr);
                        continue;
                    }
                    const { data } = supabase.storage.from('videos').getPublicUrl(storageFilePath);
                    publicUrl = data.publicUrl;
                } else if (v.type === 'youtube' && v.url) {
                    publicUrl = v.url;
                    storageFilePath = 'youtube';
                }

                if (publicUrl) {
                    await supabase.from('media_library').insert({
                        filename: v.title,
                        public_url: publicUrl,
                        storage_path: storageFilePath,
                        type: v.type, // 'file' or 'youtube'
                        organization_id: parentType === 'company' ? parentId : null,
                        job_id: parentType === 'job' ? parentId : null
                    });
                }
            }
            setPendingVideos([]);
            toast.dismiss(toastId);
            toast.success('動画を保存しました');
            fetchMedia(); // Refresh media list
        } catch (e) {
            console.error(e);
            toast.dismiss(toastId);
            toast.error('動画の保存に失敗しました');
        }
    };

    const renderVideoSection = (parentId: string | null) => (
        <div className="border-t border-slate-100 pt-6 mt-6">
            <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <Video size={16} className="text-blue-600" /> PR動画 / メディア
            </h4>

            {/* List Existing & Pending */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Existing */}
                {parentId && mediaItems.filter(m => m.organization_id === parentId || m.job_id === parentId).map(m => (
                    <div key={m.id} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden group border border-slate-200">
                        {m.type === 'youtube' ? (
                            <img src={`https://img.youtube.com/vi/${getYouTubeID(m.public_url)}/0.jpg`} className="w-full h-full object-cover opacity-80" />
                        ) : (
                            <video src={m.public_url} className="w-full h-full object-cover opacity-80" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                            <a href={m.public_url} target="_blank" rel="noopener noreferrer" className="text-white hover:scale-110 transition-transform"><ExternalLink size={16} /></a>
                        </div>
                    </div>
                ))}

                {/* Pending */}
                {pendingVideos.map((v, i) => (
                    <div key={i} className="relative aspect-video bg-blue-50 rounded-xl overflow-hidden border border-blue-200 flex items-center justify-center">
                        <span className="text-[10px] font-black text-blue-600 uppercase">{v.type}</span>
                        <button onClick={() => setPendingVideos(pendingVideos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white/50 hover:bg-white rounded-full p-1 cursor-pointer"><X size={12} /></button>
                        <div className="absolute bottom-1 left-2 text-[10px] font-bold truncate w-full pr-4">{v.title}</div>
                    </div>
                ))}
            </div>

            {/* Add New - Simple One-by-One */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex gap-4 mb-2">
                    <button onClick={() => setVideoLinkType('file')} className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${videoLinkType === 'file' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>ファイルアップロード</button>
                    <button onClick={() => setVideoLinkType('youtube')} className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${videoLinkType === 'youtube' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400'}`}>YouTubeリンク</button>
                </div>

                <div className="flex gap-2">
                    {videoLinkType === 'file' ? (
                        <input type="file" accept="video/*" ref={videoInputRef} className="text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    ) : (
                        <input type="text" placeholder="https://youtu.be/..." value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" />
                    )}
                    <button
                        onClick={() => {
                            if (videoLinkType === 'file' && videoInputRef.current?.files?.[0]) {
                                const file = videoInputRef.current.files[0];
                                setPendingVideos([...pendingVideos, { type: 'file', file, title: file.name }]);
                                videoInputRef.current.value = '';
                            } else if (videoLinkType === 'youtube' && youtubeUrl) {
                                setPendingVideos([...pendingVideos, { type: 'youtube', url: youtubeUrl, title: 'YouTube Video' }]);
                                setYoutubeUrl('');
                            }
                        }}
                        className="bg-slate-900 text-white px-4 rounded-xl font-black text-xs hover:bg-slate-700 cursor-pointer"
                    >
                        追加
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-2">※保存時にアップロード/登録されます</p>
            </div>
        </div>
    );

    const renderEditModal = () => (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            <div className={`bg-white w-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500 ${editMode === 'media' || editMode === 'course' ? 'max-w-5xl h-[90vh]' : 'max-w-xl max-h-[90vh]'}`}>
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${editMode === 'job' ? 'bg-blue-600' :
                            editMode === 'company' ? 'bg-indigo-600' :
                                editMode === 'course' ? 'bg-emerald-600' :
                                    editMode === 'media' ? 'bg-rose-600' :
                                        'bg-slate-600'
                            }`}>
                            {editMode === 'user' ? <Users size={24} /> :
                                editMode === 'company' ? <Building2 size={24} /> :
                                    editMode === 'course' ? <GraduationCap size={24} /> :
                                        editMode === 'media' ? <Video size={24} /> :
                                            <Briefcase size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">
                                {actionType === 'create' ? '新規作成' : '情報の編集'}
                            </h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">
                                {editMode === 'user' && 'ユーザープロフィール管理'}
                                {editMode === 'company' && '企業・団体情報管理'}
                                {editMode === 'job' && '求人・案件詳細管理'}
                                {editMode === 'course' && 'eラーニング教材管理'}
                                {editMode === 'media' && '動画・メディア素材管理'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setEditingItem(null)} className="p-3 hover:bg-slate-100 rounded-full transition-all cursor-pointer">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {editMode === 'user' && (
                        <div className="space-y-6">
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                                {['basic', 'detail', 'activity', 'analysis'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setModalTab(tab as any)}
                                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${modalTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {tab === 'basic' && '基本情報'}
                                        {tab === 'detail' && '詳細情報'}
                                        {tab === 'activity' && '履歴'}
                                        {tab === 'analysis' && '診断結果'}
                                    </button>
                                ))}
                            </div>
                            {modalTab === 'basic' && (
                                <div className="space-y-4">
                                    <ImageUpload
                                        currentImageUrl={editingItem.avatar_url}
                                        onImageUploaded={(url) => setEditingItem({ ...editingItem, avatar_url: url })}
                                        label="アバター画像"
                                        folder="avatars"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">姓</label>
                                            <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.last_name || ''} onChange={e => setEditingItem({ ...editingItem, last_name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">名</label>
                                            <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.first_name || ''} onChange={e => setEditingItem({ ...editingItem, first_name: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">メールアドレス</label>
                                        <input type="email" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.email || ''} onChange={e => setEditingItem({ ...editingItem, email: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">電話番号</label>
                                            <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.phone || ''} onChange={e => setEditingItem({ ...editingItem, phone: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">ユーザータイプ</label>
                                            <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.user_type || 'student'} onChange={e => setEditingItem({ ...editingItem, user_type: e.target.value })}>
                                                <option value="student">求職者</option>
                                                <option value="company">企業ユーザー</option>
                                                <option value="admin">管理者</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">生年月日 (YYYY-MM-DD) <span className="text-blue-500 ml-2 text-xs normal-case">※サクセスモード解禁条件</span></label>
                                        <input
                                            type="date"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                            value={editingItem.dob || editingItem.birthDate || ''} // Handle both potential key names if needed, though dob seems standard in this form
                                            onChange={e => setEditingItem({ ...editingItem, dob: e.target.value, birthDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                            {modalTab === 'detail' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">所属大学 / 現在の組織</label>
                                            <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.university || editingItem.company_name || ''} onChange={e => setEditingItem({ ...editingItem, university: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">学部 / 部署</label>
                                            <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.faculty || editingItem.department || ''} onChange={e => setEditingItem({ ...editingItem, faculty: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">自己紹介</label>
                                            <textarea className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[100px]" value={editingItem.bio || ''} onChange={e => setEditingItem({ ...editingItem, bio: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {modalTab === 'activity' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">eラーニング受講状況</h4>
                                        <div className="space-y-2">
                                            {relatedData.courses?.length > 0 ? relatedData.courses.map((c: any) => (
                                                <div key={c.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                                                    <span className="font-bold text-slate-700 text-xs">{c.courses?.title}</span>
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${c.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{c.status === 'completed' ? '修了' : '受講中'}</span>
                                                </div>
                                            )) : <div className="text-center py-4 text-xs font-bold text-slate-300">履歴なし</div>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">求人応募履歴</h4>
                                        <div className="space-y-2">
                                            {relatedData.applications?.length > 0 ? relatedData.applications.map((app: any) => (
                                                <div key={app.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                                                    <span className="font-bold text-slate-700 text-xs">{app.jobs?.title}</span>
                                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{app.status}</span>
                                                </div>
                                            )) : <div className="text-center py-4 text-xs font-bold text-slate-300">履歴なし</div>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {modalTab === 'analysis' && (
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Zap size={16} className="text-yellow-500" />
                                            <h4 className="font-black text-slate-900 text-sm">ポテンシャル診断結果</h4>
                                        </div>
                                        <pre className="text-[10px] font-mono text-slate-600 bg-white p-4 rounded-xl border border-slate-100 overflow-x-auto">
                                            {JSON.stringify(editingItem.diagnosis_result || { message: "診断結果はありません" }, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {editMode === 'company' && (
                        <div className="space-y-6">
                            {/* AI Auto-fill Section */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-3xl space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-indigo-700 font-black">
                                    <Zap size={20} className="text-indigo-500" />
                                    <h3>AI 企業情報アシスタント</h3>
                                </div>
                                <p className="text-[10px] text-indigo-600/80 font-bold">
                                    HPのURLを入力するだけで、会社概要や事業内容をAIが自動抽出します。
                                </p>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                                        <input
                                            type="url"
                                            placeholder="https://company-site.com"
                                            value={aiUrl}
                                            onChange={(e) => setAiUrl(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold"
                                        />
                                    </div>
                                    <button
                                        onClick={handleCompanyAiAutoFill}
                                        disabled={isAiLoading}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                    >
                                        {isAiLoading ? <span className="animate-spin">⌛</span> : <Sparkles size={16} />}
                                        {isAiLoading ? '解析中...' : 'AI自動生成'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ImageUpload
                                    currentImageUrl={editingItem.logo_url}
                                    onImageUploaded={(url) => setEditingItem({ ...editingItem, logo_url: url })}
                                    label="ロゴ画像"
                                    folder="logos"
                                />
                                <ImageUpload
                                    currentImageUrl={editingItem.cover_image_url}
                                    onImageUploaded={(url) => setEditingItem({ ...editingItem, cover_image_url: url })}
                                    label="カバー画像"
                                    folder="covers"
                                />
                            </div>

                            <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <Zap size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm">プレミアムプラン</h4>
                                    <p className="text-[10px] text-slate-500 font-bold">有効にすると、求人や企業一覧で優先表示されます</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={editingItem.is_premium || false}
                                        onChange={(e) => setEditingItem({ ...editingItem, is_premium: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                </label>
                            </div>

                            {/* 企業アカウント紐付け */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">
                                    企業アカウント紐付け
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded ml-2 normal-case font-bold">任意</span>
                                </label>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900"
                                    value={editingItem.user_id || ''}
                                    onChange={e => setEditingItem({ ...editingItem, user_id: e.target.value || null })}
                                >
                                    <option value="">紐付けしない</option>
                                    {realUsers.filter(u => u.user_type === 'company').map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.full_name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">※この企業情報を管理するユーザーアカウントを選択します。選択すると、そのユーザーはログイン後にこの企業情報を編集できるようになります。</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">企業名</label>
                                    <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.name || ''} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">業界</label>
                                        <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.industry || ''} onChange={e => setEditingItem({ ...editingItem, industry: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">所在地</label>
                                        <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.location || ''} onChange={e => setEditingItem({ ...editingItem, location: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">事業内容</label>
                                    <textarea className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[100px]" value={editingItem.business_content || ''} onChange={e => setEditingItem({ ...editingItem, business_content: e.target.value })} />
                                </div>
                                {renderVideoSection(editingItem.id || null)}
                            </div>
                        </div>
                    )}

                    {editMode === 'job' && (
                        <div className="space-y-6">
                            {/* AI Auto-fill Section */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-3xl space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-indigo-700 font-black">
                                    <Sparkles size={20} className="text-purple-500" />
                                    <h3>AI 求人作成アシスタント</h3>
                                </div>
                                <p className="text-[10px] text-indigo-600/80 font-bold">
                                    HPのURLまたは求人票(PDF/画像)から情報を自動解析します。
                                </p>

                                {/* Source Toggle */}
                                <div className="flex bg-white/60 p-1 rounded-xl w-fit border border-indigo-100">
                                    <button
                                        onClick={() => setImportSource('url')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${importSource === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        URLから
                                    </button>
                                    <button
                                        onClick={() => setImportSource('pdf')}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${importSource === 'pdf' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        PDF/画像から
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-2">
                                    {importSource === 'url' ? (
                                        <div className="relative flex-1">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                                            <input
                                                type="url"
                                                placeholder="https://example.com/jobs/123"
                                                value={aiUrl}
                                                onChange={(e) => setAiUrl(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-bold"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative flex-1">
                                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" size={16} />
                                            <input
                                                type="file"
                                                accept=".pdf,image/*"
                                                onChange={handleFileChange}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-indigo-200 bg-white text-[10px] font-bold text-slate-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            />
                                        </div>
                                    )}
                                    <button
                                        onClick={handleJobAiAutoFill}
                                        disabled={isAiLoading}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                    >
                                        {isAiLoading ? <RefreshCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                        {isAiLoading ? '解析中...' : 'AI自動生成'}
                                    </button>
                                </div>
                            </div>

                            <ImageUpload
                                currentImageUrl={editingItem.cover_image_url || editingItem.cover_image}
                                onImageUploaded={(url) => setEditingItem((prev: any) => ({ ...prev, cover_image_url: url, cover_image: url }))}
                                label="カバー画像"
                                folder="jobs"
                            />
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">タイトル</label>
                                    <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">企業</label>
                                    <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.organization_id || ''} onChange={e => setEditingItem({ ...editingItem, organization_id: e.target.value })}>
                                        <option value="">企業を選択...</option>
                                        {realCompanies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">詳細内容</label>
                                    <textarea className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 min-h-[150px]" value={editingItem.content || editingItem.description || ''} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">給与</label>
                                        <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.salary || ''} onChange={e => setEditingItem({ ...editingItem, salary: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">雇用形態</label>
                                        <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.employment_type || ''} onChange={e => setEditingItem({ ...editingItem, employment_type: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">勤務時間</label>
                                        <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.working_hours || ''} onChange={e => setEditingItem({ ...editingItem, working_hours: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">休日</label>
                                    <input type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" value={editingItem.holidays || ''} onChange={e => setEditingItem({ ...editingItem, holidays: e.target.value })} />
                                </div>
                            </div>
                            {renderVideoSection(editingItem.id || null)}
                        </div>
                    )}

                    {editMode === 'course' && renderCourseEdit()}

                    {editMode === 'media' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6 flex flex-col items-center justify-center bg-slate-900/5 rounded-[2.5rem] p-4 h-[500px]">
                                    <div className="aspect-[9/16] bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white h-full w-auto relative group/preview">
                                        {editingItem.type === 'youtube' ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${getYouTubeID(editingItem.public_url)}`}
                                                title="YouTube"
                                                frameBorder="0"
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <video src={editingItem.public_url} controls className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between font-bold gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">形式</p>
                                            <p className="text-sm text-slate-700 uppercase">{editingItem.type || 'REEL'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">登録日</p>
                                            <p className="text-sm text-slate-500">{editingItem.created_at ? new Date(editingItem.created_at).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 flex flex-col justify-between h-full">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">動画タイトル</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all"
                                                placeholder="タイトルを入力..."
                                                value={editingItem.title || ''}
                                                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">説明・キャプション</label>
                                            <textarea
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                                placeholder="キャプションを入力..."
                                                value={editingItem.caption || ''}
                                                onChange={e => setEditingItem({ ...editingItem, caption: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">リンクURL</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                                                    placeholder="https://..."
                                                    value={editingItem.link_url || ''}
                                                    onChange={e => setEditingItem({ ...editingItem, link_url: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">リンクテキスト</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:border-blue-500 outline-none"
                                                    placeholder="詳細を見る"
                                                    value={editingItem.link_text || ''}
                                                    onChange={e => setEditingItem({ ...editingItem, link_text: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <LinkIcon size={16} className="text-blue-600" />
                                            <h4 className="text-xs font-black text-slate-900">紐付け設定</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 block">関連タイプ</label>
                                                <select
                                                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-900"
                                                    value={associationType || ''}
                                                    onChange={e => {
                                                        const newType = e.target.value as 'company' | 'job' | 'quest' | '';
                                                        setAssociationType(newType || null);
                                                        setEditingItem({ ...editingItem, organization_id: null, job_id: null });
                                                    }}
                                                >
                                                    <option value="">関連なし</option>
                                                    <option value="company">企業 (Company)</option>
                                                    <option value="job">求人 (Job)</option>
                                                    <option value="quest">クエスト (Quest)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 block">コンテンツ選択</label>
                                                <select
                                                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 font-bold text-sm text-slate-900"
                                                    value={editingItem.organization_id || editingItem.job_id || ''}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (associationType === 'company') {
                                                            setEditingItem({ ...editingItem, organization_id: val, job_id: null });
                                                        } else {
                                                            setEditingItem({ ...editingItem, organization_id: null, job_id: val });
                                                        }
                                                    }}
                                                >
                                                    <option value="">選択してください</option>
                                                    {associationType === 'company' && realCompanies.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                    {associationType === 'job' && realJobs.filter(j => j.type !== 'quest').map(j => (
                                                        <option key={j.id} value={j.id}>{j.title}</option>
                                                    ))}
                                                    {associationType === 'quest' && realJobs.filter(j => j.type === 'quest').map(q => (
                                                        <option key={q.id} value={q.id}>{q.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-slate-100 flex gap-4 bg-white shrink-0">
                    <button onClick={() => setEditingItem(null)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer">
                        キャンセル
                    </button>
                    <button onClick={handleSaveEdit} className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-blue-100">
                        <Save size={20} />
                        {actionType === 'create' ? '新規登録' : '変更を保存'}
                    </button>
                </div>
            </div>
        </div >
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-sm mb-8 transition-colors group cursor-pointer">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Dashboardに戻る
                </Link>

                <main className="space-y-10">
                    {/* DEBUG PANEL */}
                    {/* DEBUG PANEL */}
                    {/* <div className="bg-red-50 border border-red-100 p-4 rounded-3xl text-[10px] font-mono text-red-600 flex gap-6">
                        <span>DEBUG MODE</span>
                        <span>Users: {realUsers.length}</span>
                        <span>Companies: {realCompanies.length}</span>
                        <span>Jobs: {realJobs.length}</span>
                        <span>Media: {mediaItems.length}</span>
                        <span>Tab: {currentTab}</span>
                    </div> */}

                    <div className="flex gap-1 bg-slate-200 p-1.5 rounded-[2rem] self-start inline-flex flex-wrap shadow-inner">
                        {[
                            { id: 'company_infos', label: '企業情報', icon: Building2 },
                            { id: 'jobs', label: '求人', icon: Briefcase },
                            { id: 'quests', label: 'クエスト', icon: Zap },
                            { id: 'media', label: '動画管理', icon: Video }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => router.push(`?tab=${tab.id}`)}
                                className={`px-5 py-3 rounded-3xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${currentTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-md transform scale-105'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
                        {currentTab === 'company_infos' && renderCompanyInfos()}
                        {currentTab === 'jobs' && renderJobs('job')}
                        {currentTab === 'quests' && renderJobs('quest')}
                        {/* {currentTab === 'learning' && renderLearning()} REMOVED */}
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
