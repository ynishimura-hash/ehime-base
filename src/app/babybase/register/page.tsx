"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Baby, Heart, ArrowLeft, ChevronRight,
    Calendar, User, MapPin, Sparkles, CheckCircle2,
    Trash2, Plus, Mail, Lock, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChildProfile } from '@/lib/types/babybase';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function MomRegistration() {
    const { updateMomProfile, momProfile } = useAppStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Form State
    const [location, setLocation] = useState(momProfile?.location || '');
    const [children, setChildren] = useState<Omit<ChildProfile, 'id'>[]>(
        momProfile?.children.map(({ id, ...rest }) => rest) || []
    );
    const [interests, setInterests] = useState<string[]>(momProfile?.interests || []);

    // Auth State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const interestOptions = [
        '母乳・混合', '離乳食・幼児食', '夜泣き・ねんね', '産後ダイエット',
        '保活・職場復帰', '知育・知育玩具', '親子おでかけ', 'ベビーマッサージ'
    ];

    const addChild = () => {
        setChildren([...children, { name: '', birthDate: '', gender: 'boy' as const, concerns: [] }]);
    };

    const removeChild = (index: number) => {
        setChildren(children.filter((_, i) => i !== index));
    };

    const updateChild = (index: number, updates: Partial<Omit<ChildProfile, 'id'>>) => {
        const newChildren = [...children];
        newChildren[index] = { ...newChildren[index], ...updates };
        setChildren(newChildren);
    };

    const toggleInterest = (interest: string) => {
        setInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const handleComplete = async () => {
        if (!email || !password) {
            toast.error('メールアドレスとパスワードを入力してください');
            return;
        }

        setLoading(true);

        try {
            // 1. Supabase Auth Sign Up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        user_type: 'student', // Mapping Mom to 'student' role for now
                        full_name: 'Mom User', // Can add name field later if needed
                    }
                }
            });

            if (error) throw error;

            // 2. Update Global State (Client-side app state)
            const finalChildren: ChildProfile[] = children.map((c, i) => ({
                ...c,
                id: `child_${Date.now()}_${i}`
            }));

            updateMomProfile({
                location,
                children: finalChildren,
                interests
            });

            // 3. Save profile details to DB (optional: if trigger handles basic info, we might need extra update for diagnosis_result/details)
            // Ideally we should update the 'profiles' table with 'diagnosis_result' storing the detailed info
            if (data.user) {
                const profileData = {
                    location,
                    children: finalChildren,
                    interests
                };

                await supabase
                    .from('profiles')
                    .update({
                        diagnosis_result: profileData
                    })
                    .eq('id', data.user.id);
            }

            toast.success('登録が完了しました！', {
                description: '確認メールを送信しました。メール内のリンクをクリックしてください。' // Supabase sends confirm email by default
            });

            // For dev/demo with email confirm off, direct login might work, generally wait for confirm
            // But let's redirect to home
            router.push('/babybase');

        } catch (error: any) {
            toast.error('登録に失敗しました', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col">
            {/* Header / Stepper */}
            <header className="px-6 py-6 border-b border-pink-50 bg-white">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-black text-slate-800">プロフィール更新</h1>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-pink-500' : 'bg-slate-100'}`} />
                    ))}
                </div>
            </header>

            <main className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {/* Step 1: Login Credentials (NEW) */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">アカウント作成</h2>
                                <p className="text-xs text-slate-500 font-bold">ログインに使用する情報を入力してください。</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">メールアドレス</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                                        <input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 shadow-sm transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">パスワード</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                                        <input
                                            type="password"
                                            placeholder="8文字以上"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 shadow-sm transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">お住まいの地域と<br />興味のあることは？</h2>
                                <p className="text-xs text-slate-500 font-bold">近隣の専門家や、特に関心の高い記事をお届けします。</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">お住まいの地域</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="例：松山市、今治市など"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 shadow-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">興味のあるカテゴリー（複数可）</label>
                                    <div className="flex flex-wrap gap-2">
                                        {interestOptions.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => toggleInterest(opt)}
                                                className={`px-4 py-3 rounded-2xl text-xs font-black transition-all border ${interests.includes(opt)
                                                    ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200'
                                                    : 'bg-white text-slate-500 border-slate-100 hover:border-pink-200'
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">お子様の情報を<br />教えてください</h2>
                                <p className="text-xs text-slate-500 font-bold">月齢に合わせた適切なアドバイスが可能になります。</p>
                            </div>

                            <div className="space-y-6">
                                {children.map((child, idx) => (
                                    <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative space-y-4 animate-in slide-in-from-bottom-2">
                                        <button
                                            onClick={() => removeChild(idx)}
                                            className="absolute top-4 right-4 text-slate-200 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500">
                                                <Baby size={20} />
                                            </div>
                                            <h3 className="font-black text-slate-800">お子様 #{idx + 1}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">ニックネーム</label>
                                                    <input
                                                        type="text"
                                                        placeholder="例：太郎"
                                                        value={child.name}
                                                        onChange={(e) => updateChild(idx, { name: e.target.value })}
                                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">誕生日</label>
                                                    <input
                                                        type="date"
                                                        value={child.birthDate}
                                                        onChange={(e) => updateChild(idx, { birthDate: e.target.value })}
                                                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">性別</label>
                                                <div className="flex gap-2">
                                                    {['boy', 'girl', 'prefer-not-to-say'].map(g => (
                                                        <button
                                                            key={g}
                                                            onClick={() => updateChild(idx, { gender: g as any })}
                                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${child.gender === g
                                                                ? 'bg-slate-900 text-white border-slate-900'
                                                                : 'bg-white text-slate-400 border-slate-100'
                                                                }`}
                                                        >
                                                            {g === 'boy' ? '男の子' : g === 'girl' ? '女の子' : 'その他'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addChild}
                                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-pink-400 hover:border-pink-200 transition-all group"
                                >
                                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                                        <Plus size={24} />
                                    </div>
                                    <span className="text-xs font-black">お子様を追加する</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center text-center space-y-8 py-12"
                        >
                            <div className="w-24 h-24 bg-pink-100 rounded-[2.5rem] flex items-center justify-center text-pink-500 shadow-xl shadow-pink-100">
                                <Sparkles size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-slate-800">準備が整いました！</h2>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-xs">
                                    愛媛県で子育てを頑張るあなたに、<br />
                                    最適な専門家と情報を厳選してお届けします。
                                </p>
                            </div>

                            <div className="w-full bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 text-left space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">登録内容のプレビュー</h3>
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{location || '未設定'}</p>
                                        <p className="text-[10px] font-bold text-slate-400">お住まいの地域</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400">
                                        <Baby size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{children.length}人のお子様</p>
                                        <p className="text-[10px] font-bold text-slate-400">家族構成</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Bottom Actions */}
            <footer className="p-6 bg-white border-t border-pink-50">
                <button
                    onClick={() => step < 4 ? setStep(step + 1) : handleComplete()}
                    disabled={loading}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-pink-200 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (step === 4 ? '登録を完了する' : '次へ進む')}
                    {!loading && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
            </footer>
        </div>
    );
}
