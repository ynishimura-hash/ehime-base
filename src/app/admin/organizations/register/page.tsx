"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Building2, School, Users, ArrowLeft, ChevronRight,
    MapPin, Globe, Sparkles, LayoutDashboard,
    Mail, Lock, Loader2, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function OrganizationRegistration() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Form State
    const [orgType, setOrgType] = useState<'company' | 'school' | 'community'>('company');
    const [orgName, setOrgName] = useState('');
    const [location, setLocation] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleComplete = async () => {
        if (!email || !password || !orgName) {
            toast.error('必須項目を入力してください');
            return;
        }

        setLoading(true);

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        user_type: 'company', // Use 'company' as generic organization admin role
                        full_name: fullName,
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('ユーザー登録に失敗しました');

            const userId = authData.user.id;

            // 2. Create Organization
            const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: orgName,
                    type: orgType,
                    location: location,
                    website_url: website,
                    description: description
                })
                .select()
                .single();

            if (orgError) throw orgError;
            if (!orgData) throw new Error('組織の作成に失敗しました');

            // 3. Link User as Admin
            const { error: memberError } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: orgData.id,
                    user_id: userId,
                    role: 'admin',
                    status: 'active'
                });

            if (memberError) throw memberError;

            toast.success('組織アカウントを作成しました！', {
                description: '確認メールを送信しました。'
            });

            router.push('/admin/approvals');

        } catch (error: any) {
            console.error(error);
            toast.error('登録に失敗しました', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="px-6 py-6 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-slate-800">パートナー登録</h1>
                        <p className="text-[10px] font-bold text-slate-400">企業・教育機関・コミュニティ</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </header>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {/* Step 1: User Account */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">管理者アカウント作成</h2>
                                <p className="text-sm text-slate-500 font-bold">組織を管理する方のアカウントを作成します。</p>
                            </div>

                            <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                                        お名前 <span className="text-red-500 ml-1">必須</span>
                                    </label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="山田 太郎"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                                        メールアドレス <span className="text-red-500 ml-1">必須</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                                        パスワード <span className="text-red-500 ml-1">必須</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            placeholder="8文字以上"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Organization Type & Basic Info */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">組織について</h2>
                                <p className="text-sm text-slate-500 font-bold">どのような形態で登録されますか？</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setOrgType('company')}
                                    className={`p-4 rounded-3xl border-2 text-left transition-all ${orgType === 'company' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-100 bg-white shadow-sm hover:shadow-md'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${orgType === 'company' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Building2 size={24} />
                                    </div>
                                    <div className="font-black text-slate-800">企業</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">採用・研修に</div>
                                </button>
                                <button
                                    onClick={() => setOrgType('school')}
                                    className={`p-4 rounded-3xl border-2 text-left transition-all ${orgType === 'school' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-100 bg-white shadow-sm hover:shadow-md'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${orgType === 'school' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <School size={24} />
                                    </div>
                                    <div className="font-black text-slate-800">教育機関</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">学生の管理に</div>
                                </button>
                                <button
                                    onClick={() => setOrgType('community')}
                                    className={`p-4 rounded-3xl border-2 text-left transition-all ${orgType === 'community' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-blue-100 bg-white shadow-sm hover:shadow-md'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${orgType === 'community' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        <Users size={24} />
                                    </div>
                                    <div className="font-black text-slate-800">コミュニティ</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">メンバー交流に</div>
                                </button>
                            </div>

                            <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                                        組織名 <span className="text-red-500 ml-1">必須</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="株式会社Ehime Base"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">所在地</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="愛媛県松山市..."
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Details */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">詳細情報</h2>
                                <p className="text-sm text-slate-500 font-bold">プロフィールを充実させましょう（後でも編集可能です）。</p>
                            </div>

                            <div className="space-y-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/50">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">ウェブサイト</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">紹介文</label>
                                    <textarea
                                        rows={5}
                                        placeholder="活動内容やビジョンについて..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 border-transparent rounded-xl py-3 px-4 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-slate-400 font-bold text-right pt-1">
                                        <Sparkles size={10} className="inline mr-1 text-blue-400" />
                                        登録後にAIがこの文章を分析してタグを自動生成します
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="p-6 bg-white border-t border-slate-200">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (step === 3 ? '登録を完了する' : '次へ進む')}
                        {!loading && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </footer>
        </div>
    );
}
