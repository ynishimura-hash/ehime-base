import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useUserStore, UserProfile } from '@/lib/store';
import { toast } from 'sonner';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { userProfile, updateUserProfile } = useUserStore();

    // Local state for form
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const [newTag, setNewTag] = useState('');
    const [newQual, setNewQual] = useState('');

    // Skill Input State
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

    // Work History Input State
    const [newWork, setNewWork] = useState({ company: '', role: '', duration: '', description: '' });

    React.useEffect(() => {
        if (isOpen) {
            setFormData(userProfile);
        }
    }, [isOpen, userProfile]);

    if (!isOpen) return null;

    const handleSave = () => {
        updateUserProfile(formData);
        toast.success('プロフィールを更新しました');
        onClose();
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };
    const removeTag = (tag: string) => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });

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
                skills: [...(formData.skills || []), { name: newSkillName.trim(), level: newSkillLevel }]
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

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-zinc-50 border-b border-zinc-100 p-4 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-zinc-800">プロフィール編集</h3>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">
                    {/* Basic Info */}
                    <section className="space-y-4">
                        <h4 className="font-black text-zinc-700 border-b pb-2">基本情報</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">お名前</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">年齢</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 mb-1 block">居住地</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800 focus:outline-none focus:border-eis-navy"
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

                    {/* Education */}
                    <section className="space-y-4">
                        <h4 className="font-black text-zinc-700 border-b pb-2">学歴</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">学校名</label>
                                <input
                                    type="text"
                                    value={formData.university || ''}
                                    onChange={e => setFormData({ ...formData, university: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">学部</label>
                                <input
                                    type="text"
                                    value={formData.faculty || ''}
                                    onChange={e => setFormData({ ...formData, faculty: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">学科・専攻</label>
                                <input
                                    type="text"
                                    value={formData.department || ''}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 mb-1 block">卒業年</label>
                                <input
                                    type="text"
                                    value={formData.graduationYear || ''}
                                    onChange={e => setFormData({ ...formData, graduationYear: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-bold text-zinc-800"
                                    placeholder="202X年"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Work History */}
                    <section className="space-y-4">
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
                                {formData.tags.map(tag => (
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
                                <select
                                    value={newSkillLevel}
                                    onChange={e => setNewSkillLevel(e.target.value as any)}
                                    className="border border-zinc-200 rounded-xl px-2 text-xs"
                                >
                                    <option value="beginner">初級</option>
                                    <option value="intermediate">中級</option>
                                    <option value="advanced">上級</option>
                                </select>
                                <button onClick={addSkill} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.skills?.map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100 text-xs font-bold">
                                        {s.name} ({s.level === 'beginner' ? '初級' : s.level === 'intermediate' ? '中級' : '上級'})
                                        <button onClick={() => removeSkill(i)} className="hover:text-orange-800"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

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
        </div>
    );
}
