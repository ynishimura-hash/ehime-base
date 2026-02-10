"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import {
    Mail, Lock, Loader2, ArrowRight, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterSeekerPage() {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Proactive Cleanup on Mount
    useEffect(() => {
        console.log('--- DEBUG_SIGNUP_V3 ---');
        const clearSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                console.log('Stale session detected on mount. Clearing...');
                await supabase.auth.signOut();
                useAppStore.getState().resetState();
                // Optional: hard reload if session was found to be extra safe
                // window.location.reload(); 
            }
        };
        clearSession();
    }, []);

    const handleSignUp = async () => {
        if (!email || !password || password.length < 8) {
            toast.error('必須項目を入力してください（パスワードは8文字以上）');
            return;
        }

        setLoading(true);

        try {
            console.log('handleSignUp start [V3]');
            // Force logout any existing/stale session before trying to register
            console.log('Ensuring clean session (force signOut)...');
            await supabase.auth.signOut().catch((e: any) => console.warn('signOut error:', e));

            // Clear store
            useAppStore.getState().resetState();

            // Wait slightly for session to clear
            await new Promise(r => setTimeout(r, 1000));

            // Check email duplication
            const cleanEmail = email.trim();
            // console.log('Checking email via RPC:', cleanEmail);
            // const { data: emailExists, error: checkError } = await supabase.rpc('check_email_exists', { email_check: cleanEmail });
            // console.log('Email check result:', { emailExists, checkError });

            // if (checkError) {
            //     console.error('Email check RPC failed:', checkError);
            //     // throw checkError; // Don't block if RPC fails
            // }

            // if (emailExists) {
            //     console.log('Email already exists');
            //     toast.warning('このメールアドレスは既に登録されています', {
            //         description: 'ログインページへ移動してください。',
            //         duration: 5000,
            //     });
            //     setLoading(false);
            //     return;
            // }

            console.log('Proceeding to Supabase SignUp with:', cleanEmail);

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('SUPABASE_SIGNUP_TIMEOUT')), 30000) // 30s timeout
            );

            // Sign Up with Redirect to Onboarding
            const signUpPromise = supabase.auth.signUp({
                email: cleanEmail,
                password,
                options: {
                    // occupation_status moved to Onboarding
                    data: {
                        user_type: 'student', // Initial role default
                    },
                    // Redirect to Auth Callback after email verification
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            // Race the signUp against the timeout
            const result: any = await Promise.race([signUpPromise, timeoutPromise]);
            const { data, error: authError } = result;

            console.log('SignUp result:', { data, authError });

            if (authError) throw authError;

            // Check if email confirmation is disabled (Auto-confirm)
            if (data?.session) {
                toast.success('登録完了！', { description: 'セットアップへ進みます' });

                // Force hard navigation AND pass tokens manually to guarantee restoration
                // This bypasses cookie timing issues completely
                const hash = `#access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&type=recovery`;
                window.location.assign('/onboarding/seeker' + hash);
                return;
            }

            // Success View (Only if session is null, meaning email confirmation IS required)
            setIsSuccess(true);
            toast.success('確認メールを送信しました！', {
                description: 'メール内のリンクをクリックして登録を完了してください。'
            });

        } catch (error: any) {
            console.error('Registration Error:', error);
            if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
                toast.warning('このメールアドレスは既に登録されています', {
                    description: 'ログインページからログインしてください。',
                    action: {
                        label: 'ログインへ',
                        onClick: () => router.push('/login/seeker')
                    }
                });
            } else {
                toast.error('登録に失敗しました', { description: error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">確認メールを送信しました</h2>
                    <p className="text-sm font-bold text-slate-500 leading-relaxed">
                        <span className="text-blue-600 font-bold">{email}</span> 宛にメールを送信しました。<br />
                        メール内のリンクをクリックして、<br />プロフィールの作成へ進んでください。
                    </p>
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 font-bold">
                            メールが届かない場合は、迷惑メールフォルダもご確認ください。
                        </p>
                    </div>
                    <Link href="/login/seeker" className="block w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors mt-4">
                        ログイン画面へ戻る
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 p-8 space-y-6 border border-slate-100">

                <div className="text-center space-y-2 pt-4">
                    <h1 className="text-2xl font-black text-slate-800">新規アカウント作成</h1>
                    <p className="text-sm font-bold text-slate-400">Ehime Baseで新しい可能性を見つけよう</p>
                </div>

                <div className="space-y-6">
                    {/* Attribute selection removed from here */}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                                メールアドレス <span className="text-red-500 ml-1">必須</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                                パスワード (英数8文字以上) <span className="text-red-500 ml-1">必須</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                    placeholder="8文字以上"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSignUp}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70 shadow-lg shadow-blue-200"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'アカウントを作成'}
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>

                <div className="text-center pt-2">
                    <p className="text-sm font-bold text-slate-400">
                        すでにアカウントをお持ちの方は
                        <Link href="/login/seeker" className="ml-2 text-blue-600 hover:text-blue-700 font-black hover:underline transition-all">
                            ログイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
