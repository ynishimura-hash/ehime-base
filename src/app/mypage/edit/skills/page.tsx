'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Briefcase, Award, Link as LinkIcon, Save } from 'lucide-react';
import ItemSelectionModal from '@/components/modals/ItemSelectionModal';
import { SKILLS_LIST, QUALIFICATIONS_LIST } from '@/data/masterData';

export default function ProfileEditSkillsPage() {
    const { users, currentUserId, updateUser } = useAppStore();
    const router = useRouter();

    const currentUser = users.find(u => u.id === currentUserId);

    // Initial State
    const [skills, setSkills] = useState<string[]>(currentUser?.skills || []);
    const [qualifications, setQualifications] = useState<string[]>(currentUser?.qualifications || []);
    const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolioUrl || '');

    useEffect(() => {
        if (currentUser) {
            setSkills(currentUser.skills || []);
            setQualifications(currentUser.qualifications || []);
            setPortfolioUrl(currentUser.portfolioUrl || '');
        }
    }, [currentUser]);

    // Modal State
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [isQualModalOpen, setIsQualModalOpen] = useState(false);

    if (!currentUser) return null;

    const handleSave = () => {
        updateUser(currentUserId, {
            skills: skills,
            qualifications,
            portfolioUrl
        });
        router.push('/mypage/profile-checklist');
    };

    const handleAddSkill = (newSkills: string[]) => {
        const uniqueSkills = newSkills.filter(s => !skills.includes(s));
        if (uniqueSkills.length > 0) {
            setSkills([...skills, ...uniqueSkills]);
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleAddQual = (newQuals: string[]) => {
        const uniqueQuals = newQuals.filter(q => !qualifications.includes(q));
        if (uniqueQuals.length > 0) {
            setQualifications([...qualifications, ...uniqueQuals]);
        }
    };

    const removeQual = (qual: string) => {
        setQualifications(qualifications.filter(q => q !== qual));
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-slate-800">スキル・資格</span>
                <button onClick={handleSave} className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                    <Save size={20} />
                </button>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">

                {/* Skills Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <Briefcase size={20} />
                        </div>
                        <h2 className="font-black text-lg">スキル・経験</h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-sm flex items-center gap-2">
                                {skill}
                                <button onClick={() => removeSkill(skill)} className="hover:text-blue-900"><X size={14} /></button>
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div
                            onClick={() => setIsSkillModalOpen(true)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-400 text-sm cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            追加するスキルを選択...
                        </div>
                        <button
                            onClick={() => setIsSkillModalOpen(true)}
                            className="px-4 rounded-xl font-bold text-sm flex items-center justify-center bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                        >
                            追加
                        </button>
                    </div>
                </div>

                {/* Qualifications Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                            <Award size={20} />
                        </div>
                        <h2 className="font-black text-lg">保有資格</h2>
                    </div>

                    <div className="space-y-2">
                        {qualifications.map(qual => (
                            <div key={qual} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <span className="font-bold text-slate-700 text-sm">{qual}</span>
                                <button onClick={() => removeQual(qual)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div
                            onClick={() => setIsQualModalOpen(true)}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-400 text-sm cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            追加する資格を選択...
                        </div>
                        <button
                            onClick={() => setIsQualModalOpen(true)}
                            className="px-4 rounded-xl font-bold text-sm flex items-center justify-center bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                        >
                            追加
                        </button>
                    </div>
                </div>

                {/* Portfolio Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                            <LinkIcon size={20} />
                        </div>
                        <h2 className="font-black text-lg">
                            ポートフォリオ・リンク
                            <span className="text-sm font-normal text-slate-400 ml-2">(任意)</span>
                        </h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">URLを入力</label>
                        <input
                            type="text"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 text-sm focus:outline-none focus:border-purple-500 placeholder-slate-400"
                            placeholder="https://..."
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pb-8">
                    <button onClick={handleSave} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
                        保存して戻る
                    </button>
                </div>
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
        </div>
    );
}

