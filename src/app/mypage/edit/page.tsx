"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Loader2, ChevronLeft, ChevronRight, Search, Check, Save, Plus, X } from 'lucide-react';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { calculateAge } from '@/lib/dateUtils';

import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/canvasUtils';
import ItemSelectionModal from '@/components/modals/ItemSelectionModal';
import { SKILLS_LIST, QUALIFICATIONS_LIST } from '@/data/masterData';

export default function ProfileEditPage() {
    const { users, currentUserId, updateUser } = useAppStore();

    const currentUser = users.find(u => u.id === currentUserId);
    const router = useRouter();

    // Safety check: If authenticated but no user found, fetch users
    useEffect(() => {
        if (currentUserId && !currentUser) {
            console.log('ProfileEdit: No user found, fetching...');
            useAppStore.getState().fetchUsers();
        }
    }, [currentUserId, currentUser]);

    const [form, setForm] = useState({
        name: currentUser?.name || '',
        lastName: currentUser?.lastName || '',
        firstName: currentUser?.firstName || '',
        university: currentUser?.university || '',
        schoolType: currentUser?.schoolType || 'university',
        occupationStatus: currentUser?.occupationStatus || 'student',
        bio: currentUser?.bio || '',
        faculty: currentUser?.faculty || '',
        department: currentUser?.department || '',
        graduationYear: currentUser?.graduationYear || '',
        gender: currentUser?.gender || 'other',
        image: currentUser?.image || '',
        birthDate: currentUser?.birthDate || '',
        tags: currentUser?.tags || [],
        qualifications: currentUser?.qualifications || [],
        skills: currentUser?.skills || [],
        workHistory: currentUser?.workHistory || [],
        portfolioUrl: currentUser?.portfolioUrl || '',
    });

    const [locationInput, setLocationInput] = useState('');

    // School Search State
    const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
    const [schoolSearchResults, setSchoolSearchResults] = useState<any[]>([]);
    const [isSearchingSchool, setIsSearchingSchool] = useState(false);
    const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

    // School Search Effect
    useEffect(() => {
        const searchSchools = async () => {
            if (!schoolSearchQuery || schoolSearchQuery.length < 2) {
                setSchoolSearchResults([]);
                return;
            }
            // Removed the check "schoolSearchQuery === form.university" to fix autocomplete while typing

            setIsSearchingSchool(true);
            try {
                const type = form.schoolType || 'university';
                const response = await fetch(`/api/schools?q=${encodeURIComponent(schoolSearchQuery)}&type=${encodeURIComponent(type)}`);
                const result = await response.json();
                if (response.ok) {
                    setSchoolSearchResults(result.data);
                }
            } catch (error) {
                console.error('School search error:', error);
            } finally {
                setIsSearchingSchool(false);
            }
        };
        const timeout = setTimeout(searchSchools, 300);
        return () => clearTimeout(timeout);
    }, [schoolSearchQuery, form.schoolType, form.university]);

    useEffect(() => {
        if (currentUser) {
            // Initial split logic if specific fields missing
            let initialLast = currentUser.lastName || '';
            let initialFirst = currentUser.firstName || '';

            if (!initialLast && !initialFirst && currentUser.name) {
                // Try to split by space (full or half width)
                const parts = currentUser.name.split(/[\s　]+/);
                if (parts.length > 0) initialLast = parts[0];
                if (parts.length > 1) initialFirst = parts.slice(1).join(' ');
            }

            setForm(prev => ({
                ...prev,
                name: currentUser.name || '',
                lastName: initialLast,
                firstName: initialFirst,
                university: currentUser.university === '未設定' ? '' : (currentUser.university || ''),
                schoolType: currentUser.schoolType || 'university',
                occupationStatus: currentUser.occupationStatus || 'student',
                bio: currentUser.bio || '',
                faculty: currentUser.faculty || '',
                department: currentUser.department || '',
                graduationYear: currentUser.graduationYear || '',
                gender: currentUser.gender || 'other',
                image: currentUser.image || '',
                birthDate: currentUser.birthDate || '',
                tags: currentUser.tags || [],
                qualifications: currentUser.qualifications || [],
                skills: currentUser.skills || [],
                workHistory: currentUser.workHistory || [],
                portfolioUrl: currentUser.portfolioUrl || '',
            }));

            // Extract location from desiredConditions
            setLocationInput(currentUser.desiredConditions?.location?.[0] || '');

            // Init local state for search
            if (currentUser.university && currentUser.university !== '未設定') {
                setSchoolSearchQuery(currentUser.university);
            }
        }
    }, [currentUser]);

    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Modal State
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [isQualModalOpen, setIsQualModalOpen] = useState(false);

    // Validated Types for array inputs
    // UI Local State for array inputs
    const [newTag, setNewTag] = useState('');
    const [newQual, setNewQual] = useState('');
    const [newSkillName, setNewSkillName] = useState('');

    const [newWork, setNewWork] = useState({ company: '', role: '', duration: '', description: '' });

    // --- Helpers for Arrays ---
    const addTag = () => {
        if (newTag.trim() && !form.tags?.includes(newTag.trim())) {
            setForm({ ...form, tags: [...(form.tags || []), newTag.trim()] });
            setNewTag('');
        }
    };
    const removeTag = (tag: string) => setForm({ ...form, tags: form.tags?.filter(t => t !== tag) });

    const handleAddQual = (newQuals: string[]) => {
        const currentQuals = form.qualifications || [];
        const uniqueQuals = newQuals.filter(q => !currentQuals.includes(q));
        if (uniqueQuals.length > 0) {
            setForm({ ...form, qualifications: [...currentQuals, ...uniqueQuals] });
        }
    };

    // Legacy manual add (optional keep or replace)
    const addQualManual = () => {
        if (newQual.trim() && !form.qualifications?.includes(newQual.trim())) {
            setForm({ ...form, qualifications: [...(form.qualifications || []), newQual.trim()] });
            setNewQual('');
        }
    };
    const removeQual = (q: string) => setForm({ ...form, qualifications: form.qualifications?.filter(t => t !== q) });

    const handleAddSkill = (newSkills: string[]) => {
        const currentSkills = form.skills || [];
        // Extract names if objects (legacy support)
        const currentNames = currentSkills.map(s => typeof s === 'string' ? s : (s as any).name);

        const uniqueSkills = newSkills.filter(s => !currentNames.includes(s));
        if (uniqueSkills.length > 0) {
            setForm(prev => ({
                ...prev,
                skills: [...(prev.skills || []), ...uniqueSkills]
            }));
        }
    };

    const addSkillManual = (e?: React.FormEvent) => {
        e?.preventDefault(); // Prevent form submission
        if (newSkillName.trim()) {
            setForm(prev => ({
                ...prev,
                skills: [...(prev.skills || []), newSkillName.trim()]
            }));
            setNewSkillName('');
        }
    };
    const removeSkill = (index: number) => {
        const newSkills = [...(form.skills || [])];
        newSkills.splice(index, 1);
        setForm({ ...form, skills: newSkills });
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        action: () => void
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            if (e.nativeEvent.isComposing) return; // Ignore IME composition
            action();
        }
    };

    const addWork = () => {
        if (newWork.company.trim()) {
            setForm({
                ...form,
                workHistory: [...(form.workHistory || []), newWork]
            });
            setNewWork({ company: '', role: '', duration: '', description: '' });
        }
    };
    const removeWork = (index: number) => {
        const newHist = [...(form.workHistory || [])];
        newHist.splice(index, 1);
        setForm({ ...form, workHistory: newHist });
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            // Validate size (e.g. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('画像サイズは5MB以下にしてください');
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result as string));
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const performUpload = async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        setIsUploading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error('Could not create cropped image');

            // Upload via API to bypass RLS
            const formData = new FormData();
            // Use original extension or default to jpg
            formData.append('file', new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' }));

            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error?.includes("Bucket not found")) {
                    throw new Error("Storage bucket not configured. Please contact admin.");
                }
                throw new Error(data.error || 'Upload failed');
            }

            if (data?.publicUrl) {
                setForm(prev => ({ ...prev, image: data.publicUrl }));
                toast.success('画像をアップロードしました（保存ボタンを押して確定してください）');
                setImageSrc(null); // Close modal
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error('画像のアップロードに失敗しました: ' + (error.message || 'Unknown error'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;

        // Combine for legacy name field
        const fullName = `${form.lastName || ''} ${form.firstName || ''}`.trim();

        // Optionally pass image explicitly if needed, but updateUser usually takes Partial<User>
        // form has 'image' field included now.
        const updateData: any = {
            ...form,
            university: form.university?.trim(),
            faculty: form.faculty?.trim(),
            department: form.department?.trim(),
            bio: form.bio?.trim(),
            desiredConditions: {
                ...currentUser.desiredConditions,
                location: locationInput ? [locationInput] : []
            }
        };
        if (fullName) updateData.name = fullName;

        try {
            setIsSaving(true);
            console.log('Page: Calling updateUser...');
            await updateUser(currentUserId, updateData);
            console.log('Page: updateUser returned.');
            toast.success('プロフィールを更新しました');
            // Give a small delay for user to see success state
            setTimeout(() => {
                router.back();
            }, 500);
        } catch (error: any) {
            console.error('Save failed:', error);
            // If timeout or specific error
            if (error.message === 'Update timeout') {
                toast.error('保存処理がタイムアウトしました。通信環境を確認してください。');
            } else {
                toast.error(`エラーが発生しました: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const age = calculateAge(form.birthDate);

    if (!currentUser) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold text-sm">プロフィール情報を読み込んでいます...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-slate-800">プロフィール編集</span>
                <button onClick={handleSave} className="w-10 h-10 bg-eis-blue/10 text-eis-blue rounded-full flex items-center justify-center font-bold">
                    <Save size={20} />
                </button>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">
                {/* Image Upload */}
                <div className="flex flex-col items-center">
                    <div className="relative cursor-pointer group" onClick={handleImageClick}>
                        <img
                            src={form.image || getFallbackAvatarUrl(currentUser.id, form.gender)}
                            alt={currentUser.name}
                            className={`w-28 h-28 rounded-full object-cover border-4 border-white shadow-md transition-all group-hover:brightness-90 ${isUploading ? 'opacity-50' : ''}`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (!target.getAttribute('data-error-tried')) {
                                    target.setAttribute('data-error-tried', 'true');
                                    target.src = getFallbackAvatarUrl(currentUser.id, form.gender);
                                }
                            }}
                        />
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                            {isUploading ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Camera size={14} />
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={onFileChange}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">タップして画像を変更</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">姓</label>
                            <input
                                type="text"
                                name="lastName"
                                value={form.lastName || ''}
                                onChange={handleChange}
                                placeholder="山田"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">名</label>
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName || ''}
                                onChange={handleChange}
                                placeholder="太郎"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        {/* Hidden Name Field */}
                        <input type="hidden" name="name" value={form.name || ''} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">生年月日</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="date"
                                name="birthDate"
                                value={form.birthDate}
                                max={new Date().toISOString().split('T')[0]} // Modalと統一
                                min="1900-01-01" // Modalと統一
                                onChange={handleChange}
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                            <div className="bg-slate-100 px-4 py-3 rounded-xl min-w-[80px] text-center">
                                <span className="font-bold text-slate-700">{age !== null ? `${age}歳` : '- 歳'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">居住地</label>
                    <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="例：愛媛県松山市"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">属性</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'student', label: '学生' },
                                { id: 'worker', label: '社会人' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setForm({ ...form, occupationStatus: opt.id as any })}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${form.occupationStatus === opt.id
                                        ? 'bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {form.occupationStatus === 'student' && (
                        <div className="space-y-4 p-4 bg-slate-100/50 rounded-2xl border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">学校種別</label>
                                <div className="relative">
                                    <select
                                        value={form.schoolType || 'university'}
                                        onChange={(e) => setForm({ ...form, schoolType: e.target.value as any })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 appearance-none"
                                    >
                                        <option value="university">大学</option>
                                        <option value="graduate">大学院</option>
                                        <option value="junior_college">短期大学</option>
                                        <option value="vocational">専門学校</option>
                                        <option value="high_school">高等学校</option>
                                        <option value="technical_college">高等専門学校</option>
                                        <option value="junior_high">中学校</option>
                                        <option value="other">その他</option>
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">学校名</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={schoolSearchQuery}
                                        onChange={(e) => {
                                            setSchoolSearchQuery(e.target.value);
                                            setForm({ ...form, university: e.target.value });
                                            setShowSchoolDropdown(true);
                                        }}
                                        onFocus={() => setShowSchoolDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                                        placeholder="学校名を入力して検索..."
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
                                    />
                                    {isSearchingSchool && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={18} />
                                    )}
                                    {showSchoolDropdown && schoolSearchResults.length > 0 && (
                                        <div className="absolute z-20 w-full bg-white border border-slate-100 rounded-xl shadow-lg mt-2 max-h-60 overflow-y-auto">
                                            {schoolSearchResults.map((school) => (
                                                <button
                                                    key={school.id}
                                                    onClick={() => {
                                                        setForm({ ...form, university: school.name });
                                                        setSchoolSearchQuery(school.name);
                                                        setShowSchoolDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 font-bold text-sm text-slate-700 flex items-center justify-between"
                                                >
                                                    {school.name}
                                                    {form.university === school.name && <Check size={16} className="text-blue-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold pl-2">
                                    ※候補にない場合もそのまま入力可能です
                                </p>
                            </div>
                        </div>
                    )}

                    {form.occupationStatus === 'worker' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">現在の勤務先 / 職業</label>
                                <input
                                    type="text"
                                    name="university"
                                    value={form.university}
                                    onChange={handleChange}
                                    placeholder="株式会社〇〇 など"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Work History */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">職歴詳細</label>
                                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3">
                                    <input
                                        placeholder="会社名"
                                        className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"
                                        value={newWork.company}
                                        onChange={e => setNewWork({ ...newWork, company: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <input placeholder="役職" className="flex-1 p-2 rounded-lg border border-slate-200 text-sm" value={newWork.role} onChange={e => setNewWork({ ...newWork, role: e.target.value })} />
                                        <input placeholder="期間" className="flex-1 p-2 rounded-lg border border-slate-200 text-sm" value={newWork.duration} onChange={e => setNewWork({ ...newWork, duration: e.target.value })} />
                                    </div>
                                    <textarea placeholder="詳細" className="w-full p-2 rounded-lg border border-slate-200 text-sm resize-none" rows={2} value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} />
                                    <button onClick={addWork} className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Plus size={14} /> 追加</button>
                                </div>
                                <div className="space-y-3">
                                    {form.workHistory?.map((work, idx) => (
                                        <div key={idx} className="relative p-3 bg-white border border-slate-200 rounded-xl">
                                            <button onClick={() => removeWork(idx)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X size={16} /></button>
                                            <h5 className="font-bold text-sm text-slate-800">{work.company}</h5>
                                            <p className="text-xs text-slate-500 mb-1">{work.duration} | {work.role}</p>
                                            <p className="text-xs text-slate-600">{work.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">性別</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'male', label: '男性' },
                            { id: 'female', label: '女性' },
                            { id: 'other', label: 'その他' }
                        ].map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setForm({ ...form, gender: g.id })}
                                className={`py-3 rounded-xl font-bold text-sm transition-all border-2 ${form.gender === g.id
                                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">学部</label>
                        <input
                            type="text"
                            name="faculty"
                            value={form.faculty}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">学科・専攻</label>
                        <input
                            type="text"
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">卒業予定</label>
                    <div className="relative">
                        <select
                            name="graduationYear"
                            value={form.graduationYear}
                            onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 appearance-none"
                        >
                            <option value="">選択してください</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <option key={year} value={`${year}年`}>{year}年</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">ポートフォリオURL</label>
                        <input
                            type="url"
                            name="portfolioUrl"
                            value={(form as any).portfolioUrl || ''}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Skills & Tags */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="font-bold text-slate-700">スキル・資格</h4>

                        {/* Tags */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">アピールタグ</label>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={e => handleKeyDown(e, addTag)}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    placeholder="新しいタグ..."
                                />
                                <button type="button" onClick={() => addTag()} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.tags?.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-bold">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-blue-800"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">資格</label>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newQual}
                                    onChange={e => setNewQual(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, addQualManual)}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    placeholder="資格名..."
                                />
                                <button type="button" onClick={() => setIsQualModalOpen(true)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.qualifications?.map(q => (
                                    <span key={q} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-bold">
                                        {q}
                                        <button onClick={() => removeQual(q)} className="hover:text-emerald-800"><X size={14} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">スキル</label>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newSkillName}
                                    onChange={e => setNewSkillName(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, (e) => addSkillManual(e))}
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                    placeholder="スキル名..."
                                />
                                <button type="button" onClick={() => setIsSkillModalOpen(true)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {form.skills?.map((s, i) => {
                                    // Handle legacy object format if needed, though type is string[]
                                    const skillName = typeof s === 'string' ? s : (s as any).name;
                                    return (
                                        <span key={i} className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg border border-orange-100 text-xs font-bold">
                                            {skillName}
                                            <button type="button" onClick={() => removeSkill(i)} className="hover:text-orange-800"><X size={14} /></button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">自己紹介</label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                    />
                </div>
            </div>

            <div className="pt-4 max-w-md mx-auto px-6">
                <button
                    onClick={handleSave}
                    disabled={isUploading || isSaving}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>保存中...</span>
                        </>
                    ) : (
                        <span>変更を保存する</span>
                    )}
                </button>
            </div>

            {/* Modals */}
            <ItemSelectionModal
                isOpen={isSkillModalOpen}
                onClose={() => setIsSkillModalOpen(false)}
                onSelect={handleAddSkill}
                title="スキル・経験"
                items={SKILLS_LIST}
            />
            <ItemSelectionModal
                isOpen={isQualModalOpen}
                onClose={() => setIsQualModalOpen(false)}
                onSelect={handleAddQual}
                title="保有資格"
                items={QUALIFICATIONS_LIST}
            />

            {/* Crop Modal */}
            {imageSrc && (
                <div className="fixed inset-0 z-50 bg-black/80 flex flex-col pt-10 pb-10">
                    <div className="relative w-full flex-1 bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            cropShape="round"
                            showGrid={false}
                        />
                    </div>
                    <div className="px-6 pt-6 pb-2 bg-white rounded-t-2xl space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">拡大 / 縮小</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setImageSrc(null)}
                                className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 rounded-xl"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={performUpload}
                                disabled={isUploading}
                                className="flex-1 py-4 font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200"
                            >
                                {isUploading ? 'アップロード中...' : '決定する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
