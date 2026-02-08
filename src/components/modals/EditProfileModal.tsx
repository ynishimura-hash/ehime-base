
import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Search, Loader2, Check, ChevronRight } from 'lucide-react';
import { useAppStore, User } from '@/lib/appStore';
import { toast } from 'sonner';
import { calculateAge } from '@/lib/dateUtils';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { currentUserId, users, updateUser } = useAppStore();
    const currentUser = users.find(u => u.id === currentUserId);

    // Form State
    const [formData, setFormData] = useState<Partial<User>>({});

    // UI Local State for array inputs
    const [newTag, setNewTag] = useState('');
    const [newQual, setNewQual] = useState('');
    const [newSkillName, setNewSkillName] = useState('');

    const [newWork, setNewWork] = useState({ company: '', role: '', duration: '', description: '' });

    // Status State
    const [occupationStatus, setOccupationStatus] = useState<'student' | 'worker'>('student');

    // Location is nested in desiredConditions for User type
    const [locationInput, setLocationInput] = useState('');

    useEffect(() => {
        if (isOpen && currentUser) {
            // Initial split logic if specific fields missing
            let initialLast = currentUser.lastName || '';
            let initialFirst = currentUser.firstName || '';

            if (!initialLast && !initialFirst && currentUser.name) {
                // Try to split by space (full or half width)
                const parts = currentUser.name.split(/[\s　]+/);
                if (parts.length > 0) initialLast = parts[0];
                if (parts.length > 1) initialFirst = parts.slice(1).join(' ');
            }

            setFormData({
                name: currentUser.name,
                lastName: initialLast,
                firstName: initialFirst,
                // age: currentUser.age, 
                birthDate: currentUser.birthDate, // Added birthDate
                bio: currentUser.bio || '',
                tags: currentUser.tags || [],
                qualifications: currentUser.qualifications || [],
                skills: currentUser.skills || [],
                workHistory: currentUser.workHistory || [],
                portfolioUrl: currentUser.portfolioUrl || '',
                university: currentUser.university === '未設定' ? '' : (currentUser.university || ''),
                faculty: currentUser.faculty || '',
                department: currentUser.department || '',
                graduationYear: currentUser.graduationYear || '',
                occupationStatus: currentUser.occupationStatus || 'student', // Default to student if not set
            });
            setOccupationStatus(currentUser.occupationStatus || 'student');
            // Extract location
            setLocationInput(currentUser.desiredConditions?.location?.[0] || '');
            // Initialize school search query if school name exists
            if (currentUser.university && currentUser.university !== '未設定') {
                setSchoolSearchQuery(currentUser.university);
            }
        }
    }, [isOpen, currentUser]);

    // School Search State
    const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
    const [schoolSearchResults, setSchoolSearchResults] = useState<any[]>([]);
    const [isSearchingSchool, setIsSearchingSchool] = useState(false);
    const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

    // School Search Effect
    useEffect(() => {
        const searchSchools = async () => {
            // Don't search if query is empty or same as current selection (to avoid re-search on select)
            if (!schoolSearchQuery || schoolSearchQuery.length < 2) {
                setSchoolSearchResults([]);
                return;
            }
            // Skipping the check "schoolSearchQuery === formData.university" because it blocks searching while typing

            setIsSearchingSchool(true);
            try {
                const type = formData.schoolType || 'university';
                const response = await fetch(`/api/schools?q=${encodeURIComponent(schoolSearchQuery)}&type=${encodeURIComponent(type)}`);
                const result = await response.json();

                if (!response.ok) {
                    console.error('School search API error:', result.error);
                } else {
                    setSchoolSearchResults(result.data);
                }
            } catch (error) {
                console.error('School search fetch failed:', error);
            } finally {
                setIsSearchingSchool(false);
            }
        };

        const timeoutId = setTimeout(searchSchools, 300);
        return () => clearTimeout(timeoutId);
    }, [schoolSearchQuery, formData.schoolType, formData.university]);


    if (!isOpen) return null;

    const handleSave = () => {
        if (!currentUserId) return;

        // Combine for legacy name field
        const fullName = `${formData.lastName || ''} ${formData.firstName || ''}`.trim();

        updateUser(currentUserId, {
            ...formData,
            name: fullName,
            university: formData.university?.trim(),
            faculty: formData.faculty?.trim(),
            bio: formData.bio?.trim(),
            // Ensure birthDate is null if empty string to avoid DB errors
            birthDate: (formData.birthDate || null) as any,
            occupationStatus, // Save the status
            desiredConditions: {
                ...currentUser?.desiredConditions,
                location: locationInput ? [locationInput] : []
            }
        });
        toast.success('プロフィールを更新しました');
        onClose();
    };

    // --- Helpers ---
    const addTag = () => {
        if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...(formData.tags || []), newTag.trim()] });
            setNewTag('');
        }
    };
    const removeTag = (tag: string) => setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) });

    const addQual = () => {
        if (newQual.trim() && !formData.qualifications?.includes(newQual.trim())) {
            setFormData({ ...formData, qualifications: [...(formData.qualifications || []), newQual.trim()] });
            setNewQual('');
        }
    };
    const removeQual = (q: string) => setFormData({ ...formData, qualifications: formData.qualifications?.filter(t => t !== q) });

    const addSkill = () => {
        if (newSkillName.trim()) {
            setFormData({
                ...formData,
                skills: [...(formData.skills || []), newSkillName.trim()]
            });
            setNewSkillName('');
        }
    };
    const removeSkill = (index: number) => {
        const newSkills = [...(formData.skills || [])];
        newSkills.splice(index, 1);
        setFormData({ ...formData, skills: newSkills });
    };

    const addWork = () => {
        if (newWork.company.trim()) {
            setFormData({
                ...formData,
                workHistory: [...(formData.workHistory || []), newWork]
            });
            setNewWork({ company: '', role: '', duration: '', description: '' });
        }
    };
    const removeWork = (index: number) => {
        const newHist = [...(formData.workHistory || [])];
        newHist.splice(index, 1);
        setFormData({ ...formData, workHistory: newHist });
    };

    const age = calculateAge(formData.birthDate);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-zinc-50 border-b border-zinc-100 p-4 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-zinc-800">プロフィール編集</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto space-y-8">

                    {/* Status Selection */}
                    <section className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                        <label className="text-xs font-bold text-zinc-500 mb-3 block">現在のステータス</label>
                        <div className="flex bg-zinc-200 p-1 rounded-xl">
                            <button
                                onClick={() => {
                                    setOccupationStatus('student');
                                    setFormData({ ...formData, occupationStatus: 'student' });
                                    toast.info("学生ステータスに切り替えました。学校情報の入力をお願いします。");
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${occupationStatus === 'student' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                学生
                            </button>
                            <button
                                onClick={() => {
                                    setOccupationStatus('worker');
                                    setFormData({ ...formData, occupationStatus: 'worker' });
                                    toast.info("社会人ステータスに切り替えました。現在の職歴などの入力をお願いします。");
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${occupationStatus === 'worker' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                                社会人
                            </button>
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h4 className="font-black text-zinc-700 border-b pb-2">基本情報</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 mb-1 block">姓</label>
                                    <input
                                        type="text"
                                        value={formData.lastName || ''}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                        placeholder="山田"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 mb-1 block">名</label>
                                    <input
                                        type="text"
                                        value={formData.firstName || ''}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                        placeholder="太郎"
                                    />
                                </div>
                            </div>
                            {/* Hidden name field just in case */}
                            <input type="hidden" value={formData.name || ''} />

                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">生年月日</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="date"
                                        value={formData.birthDate || ''}
                                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                        min="1900-01-01" // Reasonable minimum
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                    />
                                    <div className="bg-zinc-100 px-3 py-2 rounded-xl min-w-[60px] text-center border border-zinc-200">
                                        <span className="font-bold text-zinc-700 text-sm whitespace-nowrap">
                                            {age !== null ? `${age}歳` : '- 歳'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">居住地</label>
                            <input
                                type="text"
                                value={locationInput}
                                onChange={e => setLocationInput(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                placeholder="例：愛媛県松山市"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">自己紹介</label>
                            <textarea
                                value={formData.bio || ''}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium text-zinc-800 focus:outline-none focus:border-eis-navy resize-none"
                                placeholder="経歴や意気込みなどを入力してください"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">ポートフォリオURL</label>
                            <input
                                type="url"
                                value={formData.portfolioUrl || ''}
                                onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium text-blue-600 focus:outline-none focus:border-eis-navy"
                                placeholder="https://..."
                            />
                        </div>
                    </section>

                    {/* Education - Unified with ProfileEditPage */}
                    {occupationStatus === 'student' && (
                        <section className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <h4 className="font-black text-zinc-700 border-b pb-2">学歴情報</h4>
                            <div className="space-y-4 p-4 bg-zinc-100/50 rounded-2xl border border-zinc-100">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 mb-1 block">学校種別</label>
                                    <div className="relative">
                                        <select
                                            value={formData.schoolType || 'university'}
                                            onChange={(e) => setFormData({ ...formData, schoolType: e.target.value as any })}
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 appearance-none focus:outline-none focus:border-eis-navy"
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
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 rotate-90" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 mb-1 block">学校名</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input
                                            type="text"
                                            value={schoolSearchQuery}
                                            onChange={e => {
                                                setSchoolSearchQuery(e.target.value);
                                                setFormData({ ...formData, university: e.target.value });
                                                setShowSchoolDropdown(true);
                                            }}
                                            onFocus={() => setShowSchoolDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)} // Delay to allow click
                                            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                            placeholder="学校名を入力して検索..."
                                        />
                                        {isSearchingSchool && (
                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={16} />
                                        )}
                                        {/* Dropdown */}
                                        {showSchoolDropdown && schoolSearchResults.length > 0 && (
                                            <div className="absolute z-50 w-full bg-white border border-zinc-100 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                                                {schoolSearchResults.map((school) => (
                                                    <button
                                                        key={school.id}
                                                        onClick={() => {
                                                            setFormData({ ...formData, university: school.name });
                                                            setSchoolSearchQuery(school.name);
                                                            setShowSchoolDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-zinc-50 font-bold text-sm text-zinc-700 flex items-center justify-between"
                                                    >
                                                        {school.name}
                                                        {formData.university === school.name && <Check size={14} className="text-blue-500" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold pl-1 pt-0.5">
                                        ※候補にない場合もそのまま入力できます
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 mb-1 block">学部・学科 (任意)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={formData.faculty || ''}
                                            onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                            placeholder="学部"
                                        />
                                        <input
                                            type="text"
                                            value={formData.department || ''}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                            placeholder="学科・専攻"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 mb-1 block">卒業予定</label>
                                    <div className="relative">
                                        <select
                                            value={formData.graduationYear || ''}
                                            onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 appearance-none focus:outline-none focus:border-eis-navy"
                                        >
                                            <option value="">選択してください</option>
                                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                                <option key={year} value={`${year}年`}>{year}年</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 rotate-90" size={16} />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Work History - Conditional Rendering */}
                    {occupationStatus === 'worker' && (
                        <section className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <h4 className="font-black text-zinc-700 border-b pb-2">職歴</h4>
                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
                                <input
                                    placeholder="会社名"
                                    className="w-full p-2 rounded-lg border border-zinc-200 text-sm"
                                    value={newWork.company}
                                    onChange={e => setNewWork({ ...newWork, company: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <input placeholder="役職" className="flex-1 p-2 rounded-lg border border-zinc-200 text-sm" value={newWork.role} onChange={e => setNewWork({ ...newWork, role: e.target.value })} />
                                    <input placeholder="期間" className="flex-1 p-2 rounded-lg border border-zinc-200 text-sm" value={newWork.duration} onChange={e => setNewWork({ ...newWork, duration: e.target.value })} />
                                </div>
                                <textarea placeholder="詳細" className="w-full p-2 rounded-lg border border-zinc-200 text-sm" rows={2} value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} />
                                <button onClick={addWork} className="w-full py-2 bg-zinc-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Plus size={14} /> 追加</button>
                            </div>
                            <div className="space-y-3">
                                {formData.workHistory?.map((work, idx) => (
                                    <div key={idx} className="relative p-3 bg-white border border-zinc-200 rounded-xl">
                                        <button onClick={() => removeWork(idx)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-500"><X size={16} /></button>
                                        <h5 className="font-bold text-sm">{work.company}</h5>
                                        <p className="text-xs text-zinc-500 mb-1">{work.duration} | {work.role}</p>
                                        <p className="text-xs text-zinc-600">{work.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills & Tags */}
                    <section className="space-y-4">
                        <h4 className="font-black text-zinc-700 border-b pb-2">スキル・資格</h4>

                        {/* Tags */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">アピールタグ</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTag()}
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                    placeholder="新しいタグ..."
                                />
                                <button onClick={addTag} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags?.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 text-xs font-bold">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-blue-800"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Qualifications */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">資格</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newQual}
                                    onChange={e => setNewQual(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addQual()}
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                    placeholder="資格名..."
                                />
                                <button onClick={addQual} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.qualifications?.map(q => (
                                    <span key={q} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100 text-xs font-bold">
                                        {q}
                                        <button onClick={() => removeQual(q)} className="hover:text-emerald-800"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">スキル</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newSkillName}
                                    onChange={e => setNewSkillName(e.target.value)}
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                    placeholder="スキル名..."
                                />

                                <button onClick={addSkill} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills?.map((s, i) => {
                                    // Handle legacy object format if needed, though type is string[]
                                    const skillName = typeof s === 'string' ? s : (s as any).name;
                                    return (
                                        <span key={i} className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100 text-xs font-bold">
                                            {skillName}
                                            <button onClick={() => removeSkill(i)} className="hover:text-orange-800"><X size={12} /></button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-zinc-100 bg-zinc-50 shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-full py-3 bg-eis-navy text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                    >
                        <Save size={18} />
                        保存して閉じる
                    </button>
                </div>

            </div>
        </div >
    );
}
