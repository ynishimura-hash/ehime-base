"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    User, Loader2, ArrowRight, Home,
    Calendar, Phone, Building2, Search, Check,
    Sparkles, PartyPopper, MessageCircle, HelpCircle,
    GraduationCap, Briefcase, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';

export default function OnboardingSeekerPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    // Use useState to ensure Supabase client is stable across renders
    const [supabase] = useState(() => createClient());
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');
    const [occupationStatus, setOccupationStatus] = useState<string>(''); // Get from metadata
    const [sessionError, setSessionError] = useState(false);

    // Check Auth on Mount
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async (retries = 3) => {
            // First: Try to recover from hash if present (manual transfer)
            if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
                console.log('Recovering session from hash...');

                // Manually parse because getSession might be ignoring it if configured differently
                const params = new URLSearchParams(window.location.hash.substring(1));
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');

                if (access_token && refresh_token) {
                    console.log('Manual token found, setting session...');
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token
                    });
                    if (error) console.error('Manual setSession error:', error);
                }
            }

            // Use getSession for faster/local check on mount
            const { data: { session } } = await supabase.auth.getSession();

            // Fallback to getUser if session is missing (sometimes getSession is flaky on fresh loads)
            let user = session?.user;
            if (!user) {
                const { data: { user: fetchedUser } } = await supabase.auth.getUser();
                user = fetchedUser;
            }

            if (!user) {
                if (retries > 0 && isMounted) {
                    console.log(`Auth check failed, retrying... (${retries} attempts left)`);
                    setTimeout(() => checkAuth(retries - 1), 1000); // Wait 1s and retry
                    return;
                }

                if (isMounted) {
                    console.log('No user session found in Onboarding after retries.');
                    // Don't auto-redirect to avoid infinite loops in strict environments (like IDE previews).
                    // Instead, show a clear error state with manual action.
                    toast.error('ログインセッションが見つかりませんでした。', {
                        description: '再度ログインをお試しください。',
                        duration: 5000
                    });
                    setLoading(false);
                    // Use a specific state to show the error UI instead of just returning
                    setSessionError(true);
                }
                return;
            }

            // Sync with AppStore if not already authenticated
            const { authStatus, loginAs } = useAppStore.getState();
            if (authStatus !== 'authenticated') {
                console.log('Syncing auth state in Onboarding for user:', user.id);
                loginAs('seeker', user.id);
            }

            setUserId(user.id);
            setUserEmail(user.email || '');
            setOccupationStatus(user.user_metadata?.occupation_status || 'student');
        };
        checkAuth();
    }, [router, supabase]);



    // Step 2 (Now Step 1 for User): Personal Info
    const [lastName, setLastName] = useState('');
    const [firstNameReal, setFirstNameReal] = useState('');
    const [gender, setGender] = useState('');
    const [phone, setPhone] = useState('');
    const [dobYear, setDobYear] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobDay, setDobDay] = useState('');
    const [dob, setDob] = useState('');

    const yearRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const dayRef = useRef<HTMLInputElement>(null);

    // Sync DOB
    useEffect(() => {
        if (dobYear && dobMonth && dobDay) {
            setDob(`${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`);
        } else {
            setDob('');
        }
    }, [dobYear, dobMonth, dobDay]);

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.slice(0, 4);
        setDobYear(val);
        if (val.length === 4) monthRef.current?.focus();
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.slice(0, 2);
        setDobMonth(val);
        if (val.length === 2) dayRef.current?.focus();
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.slice(0, 2);
        setDobDay(val);
    };

    // Step 3 (Now Step 2 for User): Attribute Details
    // Worker
    const [workerStatus, setWorkerStatus] = useState('company_employee');
    const [companyName, setCompanyName] = useState('');
    // Student
    const [schoolType, setSchoolType] = useState('university');
    const [schoolName, setSchoolName] = useState('');
    const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
    const [schoolSearchResults, setSchoolSearchResults] = useState<any[]>([]);
    const [isSearchingSchool, setIsSearchingSchool] = useState(false);
    const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

    // Step 4 (Now Step 3 for User): Bonus Quest (Survey)
    const [sourceOfKnowledge, setSourceOfKnowledge] = useState('');
    const [referralSource, setReferralSource] = useState('');
    const [usagePurpose, setUsagePurpose] = useState('');

    // School Search Effect
    useEffect(() => {
        const searchSchools = async () => {
            if (!schoolSearchQuery || schoolSearchQuery.length < 2) {
                setSchoolSearchResults([]);
                return;
            }
            setIsSearchingSchool(true);
            console.log('Searching schools API with:', { schoolSearchQuery, schoolType });

            try {
                const response = await fetch(`/api/schools?q=${encodeURIComponent(schoolSearchQuery)}&type=${encodeURIComponent(schoolType)}`);
                const result = await response.json();

                if (!response.ok) {
                    console.error('School search API error:', result.error);
                    toast.error('学校検索に失敗しました');
                } else {
                    console.log('School search API results:', result.data);
                    setSchoolSearchResults(result.data);
                }
            } catch (error) {
                console.error('School search fetch failed:', error);
                toast.error('通信エラーが発生しました');
            } finally {
                setIsSearchingSchool(false);
            }
        };

        const timeoutId = setTimeout(searchSchools, 300);
        return () => clearTimeout(timeoutId);
    }, [schoolSearchQuery, schoolType]);

    const handleCompleteOnboarding = async (skipSurvey = false) => {
        console.log('handleCompleteOnboarding called', { skipSurvey, userId });

        let currentUserId = userId;
        let accessToken = null;

        // Try to find access_token from URL hash if available (Critical for redirect flow)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            accessToken = params.get('access_token');
        }

        let currentUserEmail = userEmail;

        // Fallback: If userId is null, try to recover from token OR session
        if (!currentUserId || !currentUserEmail) {
            console.log('User ID or Email missing in state, attempting recovery...');

            // 1. Try Token First
            if (accessToken) {
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    if (payload.sub) {
                        console.log('User found in token payload:', payload.sub);
                        currentUserId = payload.sub;
                        setUserId(payload.sub);
                    }
                    if (payload.email) {
                        console.log('Email found in token payload:', payload.email);
                        currentUserEmail = payload.email;
                        setUserEmail(payload.email);
                    }
                } catch (e) {
                    console.error('Failed to decode token:', e);
                }
            }

            // 2. If still missing, try session
            if (!currentUserId || !currentUserEmail) {
                console.log('Fetching from session...');
                const { data: { user }, error } = await supabase.auth.getUser();
                if (user) {
                    console.log('User found in session:', user.id);
                    currentUserId = user.id;
                    setUserId(user.id);
                    currentUserEmail = user.email || '';
                    setUserEmail(user.email || '');
                } else {
                    console.error('No session found during completion:', error);
                }
            }
        }

        if (!currentUserId) {
            console.error('User ID is absolutely missing');
            toast.error('ユーザー情報の取得に失敗しました。再度ログインしてください。');
            return;
        }

        setLoading(true);
        try {
            console.log('Preparing profile data with ID:', currentUserId);
            const profileData = {
                id: currentUserId, // Use the resolved ID
                email: currentUserEmail,
                last_name: lastName,
                first_name: firstNameReal,
                full_name: `${lastName} ${firstNameReal}`,
                gender: gender,
                phone: phone,
                dob: dob,
                user_type: 'student', // Technical ID
                occupation_status: occupationStatus,
                // Worker fields
                ...(occupationStatus === 'worker' ? {
                    worker_status: workerStatus,
                    company_name: companyName,
                } : {}),
                // Student fields
                ...(occupationStatus === 'student' ? {
                    school_type: schoolType,
                    school_name: schoolName,
                } : {}),
                // Survey data
                ...(!skipSurvey ? {
                    source_of_knowledge: sourceOfKnowledge,
                    referral_source: referralSource,
                    usage_purpose: usagePurpose,
                } : {})
            };

            // Call API to UPSERT profile (Server-side)
            const headers: any = {
                'Content-Type': 'application/json',
            };
            if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }

            console.log('Sending request to /api/onboarding/complete...');
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    profileData
                }),
                // Add signal if needed, but usually not required for simple fetch
            });

            console.log('Response status:', response.status);
            const result = await response.json();

            if (!response.ok) {
                console.error('Onboarding API failed:', result);
                throw new Error(result.error || 'Unknown API Error');
            }

            console.log('Onboarding API success:', result);

            // Gender-aware Avatar Generation
            const imageUrl = getFallbackAvatarUrl(currentUserId, gender);

            // --- FIX: Manually update AppStore to prevent race condition on Dashboard ---
            const { upsertUser, fetchUsers, loginAs } = useAppStore.getState();

            // Save Avatar URL to DB (Non-blocking / Log errors but don't stop flow)
            supabase.from('profiles').update({ avatar_url: imageUrl }).eq('id', currentUserId)
                .then(({ error }: { error: any }) => {
                    if (error) console.error('Background Avatar Update Failed:', error);
                    else console.log('Background Avatar Update Success');
                })
                .catch((err: any) => console.error('Background Avatar Update Exception:', err));

            // optimistic sync of what we know
            const optimisticUser: any = {
                id: userId,
                name: `${lastName} ${firstNameReal}`,
                lastName: lastName,
                firstName: firstNameReal,
                birthDate: dob,
                age: 21, // default
                university: schoolName || '未設定',
                faculty: '',
                bio: '',
                tags: [],
                image: imageUrl,
                isOnline: true,
                qualifications: [],
                skills: [],
                workHistory: []
            };

            upsertUser(optimisticUser);

            // Trigger background fetch to get full DB state + any triggers
            fetchUsers();

            // Ensure auth state is correct
            loginAs('seeker', currentUserId);
            // --------------------------------------------------------------------------

            // Success
            if (!skipSurvey) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                toast.success('セットアップ完了！', {
                    description: 'ダッシュボードへ移動します。',
                    duration: 3000,
                });
            } else {
                toast.success('セットアップ完了！', {
                    description: 'ダッシュボードへ移動します。'
                });
            }

            // Force stop loading before redirect to give feedback
            setLoading(false);

            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (error: any) {
            console.error('Onboarding Error Details:', error);
            if (error.name === 'AbortError') {
                toast.error('通信が中断されました。再試行してください。');
            } else {
                toast.error('保存に失敗しました', { description: error.message || '不明なエラーが発生しました' });
            }
            setLoading(false);
        }
    };

    const nextStep = async () => {
        // Step 1 Validation (Attribute)
        if (step === 1 && !occupationStatus) {
            toast.error('属性を選択してください');
            return;
        }

        // Step 2 Validation (Personal Info)
        if (step === 2) {
            if (!lastName || !firstNameReal || !gender || !phone || !dobYear || !dobMonth || !dobDay) {
                toast.error('必須項目を入力してください');
                return;
            }

            // Date Validation
            const year = parseInt(dobYear);
            const month = parseInt(dobMonth);
            const day = parseInt(dobDay);

            if (isNaN(year) || isNaN(month) || isNaN(day)) {
                toast.error('生年月日を正しく入力してください');
                return;
            }

            if (month < 1 || month > 12) {
                toast.error('月は1〜12の間で入力してください');
                return;
            }

            // Check for valid date (e.g. prevent 2/30, 4/31)
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                toast.error('存在しない日付です (例: 2月30日など)');
                return;
            }

            // Future date check
            if (new Date() < date) {
                toast.error('未来の日付は入力できません');
                return;
            }

            // Reasonable range check
            if (year < 1900) {
                toast.error('正しい西暦を入力してください');
                return;
            }

            // Phone Validation
            const cleanPhone = phone.replace(/-/g, '');
            if (!/^\d{10,11}$/.test(cleanPhone)) {
                toast.error('電話番号を正しく入力してください');
                return;
            }
        }

        // Transition to Survey (Step 4) or Finish
        if (step === 3) {
            setStep(4);
            return;
        }

        setStep(step + 1);
    };

    // UI Rendering for Session Error
    if (sessionError) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <LogOut size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">セッションが見つかりません</h2>
                        <p className="text-sm text-slate-500 font-bold">
                            ログイン情報が正しく取得できませんでした。<br />
                            ブラウザのCookieが無効になっているか、<br />
                            セッションが切れている可能性があります。
                        </p>
                    </div>
                    <Link href="/login/seeker" className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl transition-all">
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        );
    }

    // UI Rendering
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 p-8 space-y-6 border border-slate-100 relative overflow-hidden">

                {/* Header */}
                <div className="text-center space-y-2 pt-4 relative">
                    <div className="absolute right-0 top-0 text-[10px] font-black text-slate-300 tracking-widest bg-slate-50 px-2 py-1 rounded-full">
                        SETUP {step} / 4
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">
                        {step === 4 ? 'ボーナスクエスト' : 'プロフィール作成'}
                    </h1>
                    <p className="text-sm font-bold text-slate-400">
                        {step === 1 ? 'あなたはどちらに当てはまりますか？' :
                            step === 4 ? 'あと少し！アンケートに答えてEXPゲット！' :
                                '詳細を教えてください'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Attribute Selection */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1 block text-center">属性を選択 <span className="text-red-500 ml-1">必須</span></label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setOccupationStatus('student')}
                                    className={`p-6 rounded-2xl border-2 text-center transition-all ${occupationStatus === 'student' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-100' : 'border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-slate-50'}`}
                                >
                                    <GraduationCap className="mx-auto mb-3 w-8 h-8" />
                                    <div className="font-black text-lg">学生</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOccupationStatus('worker')}
                                    className={`p-6 rounded-2xl border-2 text-center transition-all ${occupationStatus === 'worker' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-100' : 'border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-slate-50'}`}
                                >
                                    <Briefcase className="mx-auto mb-3 w-8 h-8" />
                                    <div className="font-black text-lg">社会人</div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Personal Info (Originally Step 1 in previous code context) */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">姓 <span className="text-red-500 ml-1">必須</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        placeholder="山田"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">名 <span className="text-red-500 ml-1">必須</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={firstNameReal}
                                        onChange={(e) => setFirstNameReal(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        placeholder="太郎"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">性別 <span className="text-red-500 ml-1">必須</span></label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['male', 'female', 'other'].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setGender(g)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all font-bold text-sm ${gender === g
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-100 text-slate-400 hover:border-blue-200'
                                                }`}
                                        >
                                            {g === 'male' ? '男性' : g === 'female' ? '女性' : 'その他'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">生年月日 <span className="text-red-500 ml-1">必須</span></label>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-[2]">
                                        <input
                                            ref={yearRef}
                                            type="number"
                                            value={dobYear}
                                            onChange={handleYearChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-center"
                                            placeholder="YYYY"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">年</span>
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={monthRef}
                                            type="number"
                                            value={dobMonth}
                                            onChange={handleMonthChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-2 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-center"
                                            placeholder="MM"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">月</span>
                                    </div>
                                    <div className="relative flex-1">
                                        <input
                                            ref={dayRef}
                                            type="number"
                                            value={dobDay}
                                            onChange={handleDayChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-2 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-center"
                                            placeholder="DD"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">日</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">電話番号 <span className="text-red-500 ml-1">必須</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        placeholder="09012345678"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Attribute Details (Originally Step 2) */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {occupationStatus === 'student' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">学校種別</label>
                                        <select
                                            value={schoolType}
                                            onChange={(e) => {
                                                setSchoolType(e.target.value);
                                                setSchoolSearchQuery('');
                                                setSchoolName('');
                                            }}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                                        >
                                            <option value="high_school">高校</option>
                                            <option value="university">大学</option>
                                            <option value="vocational">専門学校</option>
                                            <option value="junior_high">中学校</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">学校名検索</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={schoolSearchQuery}
                                                onChange={(e) => {
                                                    setSchoolSearchQuery(e.target.value);
                                                    setShowSchoolDropdown(true);
                                                    if (!e.target.value) setSchoolName('');
                                                }}
                                                onFocus={() => setShowSchoolDropdown(true)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                                placeholder="学校名を入力して検索..."
                                            />
                                            {isSearchingSchool && (
                                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={18} />
                                            )}
                                        </div>
                                        {/* Dropdown */}
                                        {showSchoolDropdown && schoolSearchResults.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white border border-slate-100 rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto">
                                                {schoolSearchResults.map((school) => (
                                                    <button
                                                        key={school.id}
                                                        onClick={() => {
                                                            setSchoolName(school.name);
                                                            setSchoolSearchQuery(school.name);
                                                            setShowSchoolDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 font-bold text-sm text-slate-700 flex items-center justify-between"
                                                    >
                                                        {school.name}
                                                        {schoolName === school.name && <Check size={16} className="text-blue-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-400 font-bold pl-2 pt-1">
                                            ※候補にない場合もそのまま入力できます
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">働き方</label>
                                        <select
                                            value={workerStatus}
                                            onChange={(e) => setWorkerStatus(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none"
                                        >
                                            <option value="company_employee">会社員</option>
                                            <option value="freelance">個人事業主 / フリーランス</option>
                                            <option value="civil_servant">公務員</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">会社名 / 屋号</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                                placeholder="勤務先を入力"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Step 4: Bonus Quest (Originally Step 3) */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6 text-center"
                        >
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-[2rem] p-6 shadow-lg shadow-yellow-200/50">
                                <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-pulse" />
                                <h3 className="text-xl font-black text-slate-800 mb-2">ボーナスクエスト出現！</h3>
                                <p className="text-sm font-bold text-slate-500 mb-6">
                                    以下のアンケートに答えると<br /><span className="text-yellow-600 text-lg">初期経験値 +100 EXP</span> を獲得できます！
                                </p>

                                <div className="space-y-4 text-left">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ehime Baseをどこで知りましたか？</label>
                                        <div className="relative">
                                            <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                value={sourceOfKnowledge}
                                                onChange={(e) => setSourceOfKnowledge(e.target.value)}
                                                className="w-full bg-white border border-yellow-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-yellow-200 transition-all outline-none appearance-none"
                                            >
                                                <option value="">選択してください</option>
                                                <option value="sns_x">X (旧Twitter)</option>
                                                <option value="sns_instagram">Instagram</option>
                                                <option value="friend">知人の紹介</option>
                                                <option value="school">学校での紹介</option>
                                                <option value="event">イベント</option>
                                                <option value="other">その他</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">紹介者 (いる場合)</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={referralSource}
                                                onChange={(e) => setReferralSource(e.target.value)}
                                                className="w-full bg-white border border-yellow-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-yellow-200 transition-all outline-none"
                                                placeholder="紹介者の名前"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">利用目的</label>
                                        <div className="relative">
                                            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <select
                                                value={usagePurpose}
                                                onChange={(e) => setUsagePurpose(e.target.value)}
                                                className="w-full bg-white border border-yellow-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-yellow-200 transition-all outline-none appearance-none"
                                            >
                                                <option value="">選択してください</option>
                                                <option value="job_search">就職・転職活動</option>
                                                <option value="skill_up">スキルアップ</option>
                                                <option value="networking">人脈作り</option>
                                                <option value="curiosity">なんとなく興味があって</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="flex gap-4 pt-4">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all"
                        >
                            戻る
                        </button>
                    )}

                    {step === 4 ? (
                        <>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleCompleteOnboarding(true);
                                }} // Skip
                                disabled={loading}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-4 rounded-2xl transition-all"
                            >
                                スキップ
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleCompleteOnboarding(false);
                                }} // Submit Quest
                                disabled={loading}
                                className="flex-[2] bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-orange-200 active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'クエストクリアして完了'}
                                {!loading && <PartyPopper size={20} className="group-hover:-rotate-12 transition-transform" />}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={loading}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70 shadow-lg shadow-blue-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : '次へ進む'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
