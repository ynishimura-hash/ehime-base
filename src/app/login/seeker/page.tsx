"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { User, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SeekerLoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const { authStatus } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const checkSession = async () => {
            if (authStatus === 'authenticated') {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        window.location.href = '/dashboard';
                    } else {
                        // Stale state detected (Authenticated in store, but no session)
                        // Reset store to allow login
                        useAppStore.getState().resetState();
                    }
                } catch (e) {
                    // Ignore abort errors
                }
            }
        };
        checkSession();
    }, [authStatus]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                const message = error.message.includes('Invalid login credentials')
                    ? 'メールアドレスまたはパスワードが間違っています'
                    : 'ログインに失敗しました';
                toast.error(message);
                setLoading(false);
                return;
            }

            if (!data.user) {
                toast.error('ユーザー情報の取得に失敗しました');
                setLoading(false);
                return;
            }

            // Sync with AppStore
            const loginAs = useAppStore.getState().loginAs;
            loginAs('seeker', data.user.id);

            toast.success('ログインしました');
            window.location.href = '/dashboard';

        } catch (error) {
            console.error('予期しないエラー:', error);
            toast.error('エラーが発生しました');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
            {/* Visual Area (Left(PC) / Top(Mobile)) */}
            <div className="relative overflow-hidden bg-blue-600 lg:h-auto min-h-[280px] p-8 lg:p-12 flex flex-col justify-between">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-400 rounded-full blur-3xl opacity-30"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                            <span className="font-black text-xl">E</span>
                        </div>
                        <span className="text-white font-black text-2xl tracking-tight">Ehime Base</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                        あなたの可能性を、<br />
                        ここから広げよう。
                    </h1>
                    {/* Benefits: Hide on mobile to save space for form */}
                    <div className="hidden lg:block space-y-4">
                        {[
                            '県内最大級の企業データベース',
                            'AIによるキャリアシミュレーション',
                            '学生・求職者向け特別イベント情報'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-blue-100 font-bold">
                                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-blue-200 text-sm font-bold hidden lg:block">
                    © 2026 Ehime Base Project. All rights reserved.
                </div>
            </div>

            {/* Right Column: Form Area */}
            <div className="flex items-center justify-center p-6 sm:p-12 -mt-10 lg:mt-0 relative z-20">
                <div className="w-full max-w-md space-y-8 bg-white lg:bg-transparent p-8 lg:p-0 rounded-[2rem] lg:rounded-none shadow-xl lg:shadow-none">
                    <div className="text-center space-y-2 lg:text-left">
                        <div className="lg:hidden w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User size={32} />
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-800">求職者ログイン</h2>
                        <p className="text-slate-500 font-bold text-sm lg:text-base">アカウント情報を入力してください</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">メールアドレス</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">パスワード</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                <div className="text-right mt-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/auth/forgot-password')}
                                        className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        パスワードをお忘れの方はこちら
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'ログインする'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>

                    <div className="text-center space-y-4">
                        <button
                            type="button"
                            onClick={() => router.push('/register/seeker')}
                            className="text-blue-600 font-black text-sm hover:underline hover:text-blue-700 transition-colors"
                        >
                            アカウントをお持ちでない方はこちら
                        </button>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={() => router.push('/')}
                                className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                            >
                                ホームに戻る
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
