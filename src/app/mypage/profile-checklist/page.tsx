'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, CheckCircle2, Circle, ChevronRight,
    User, FileText, Briefcase, Target, Trophy, Lock, Unlock
} from 'lucide-react';
import Link from 'next/link';

import { calculateProfileCompletion, getProfileSectionStatus } from '@/lib/profileUtils';

export default function ProfileChecklistPage() {
    const { users, currentUserId, authStatus } = useAppStore();
    const router = useRouter();
    const [score, setScore] = useState(0);

    const currentUser = users.find(u => u.id === currentUserId);

    useEffect(() => {
        if (!currentUser) return;
        const percentage = calculateProfileCompletion(currentUser);
        setScore(percentage);
    }, [currentUser]);

    if (!currentUser) return null;

    const status = getProfileSectionStatus(currentUser);

    const sections = [
        {
            title: '基本プロフィール',
            icon: User,
            path: '/mypage/edit',
            isComplete: status.basic,
            description: '氏名、大学、学部、卒業年度'
        },
        {
            title: '自己紹介・アバター',
            icon: FileText,
            path: '/mypage/edit',
            isComplete: status.intro,
            description: '自己PRとアイコン画像'
        },
        {
            title: 'スキル・資格・ポートフォリオ',
            icon: Briefcase,
            path: '/mypage/edit/skills',
            isComplete: status.skills,
            description: '保有スキル、資格、作品URL'
        },
        {
            title: '希望条件',
            icon: Target,
            path: '/mypage/edit/conditions',
            isComplete: status.conditions,
            description: '業種、勤務地、希望年収'
        }
    ];

    const unlocks = [
        { threshold: 30, label: 'スカウト受信機能', icon: '📬' },
        { threshold: 50, label: '精密適性診断機能', icon: '🧠' },
        { threshold: 80, label: 'プレミアム求人の閲覧', icon: '💎' },
        { threshold: 100, label: '認証バッジ付与', icon: '✅' },
    ];

    const currentUnlock = unlocks.reverse().find(u => score >= u.threshold);
    const nextUnlock = unlocks.slice().reverse().find(u => score < u.threshold);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-slate-800">プロフィール充実度</span>
                <div className="w-10" />
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">

                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" className="text-slate-100" strokeWidth="12" fill="none" stroke="currentColor" />
                            <circle
                                cx="80" cy="80" r="70"
                                className="text-blue-600 transition-all duration-1000 ease-out"
                                strokeWidth="12"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * score) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black text-slate-800">{score}<span className="text-lg">%</span></span>
                            <span className="text-[10px] font-bold text-slate-400">COMPLETED</span>
                        </div>
                    </div>

                    {/* Unlock Status */}
                    {nextUnlock ? (
                        <div className="mt-4 bg-slate-900 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg max-w-xs w-full">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Lock size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Next Unlock at {nextUnlock.threshold}%</p>
                                <p className="font-bold text-sm">{nextUnlock.label}</p>
                            </div>
                            <div className="text-2xl">{nextUnlock.icon}</div>
                        </div>
                    ) : (
                        <div className="mt-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg max-w-xs w-full">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Trophy size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-white/80 uppercase">All Completed!</p>
                                <p className="font-bold text-sm">全機能解放済み</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Checklist */}
                <div className="space-y-4">
                    <h3 className="font-black text-slate-800 text-lg">充実リスト</h3>
                    {sections.map((section, idx) => (
                        <Link
                            href={section.path}
                            key={idx}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${section.isComplete
                                ? 'bg-white border-slate-100 shadow-sm'
                                : 'bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${section.isComplete ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white'
                                }`}>
                                <section.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className={`font-bold ${section.isComplete ? 'text-slate-700' : 'text-blue-900'}`}>
                                        {section.title}
                                    </h4>
                                    {section.isComplete ? (
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    ) : (
                                        <Circle size={20} className="text-blue-400" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">
                                    {section.description}
                                </p>
                            </div>
                            {!section.isComplete && (
                                <ChevronRight size={20} className="text-blue-400" />
                            )}
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}
