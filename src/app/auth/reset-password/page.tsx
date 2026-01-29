"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Ensure session exists (link should auto-login user or provide recovery token context)
    // Supabase handles the session exchange automatically if hash fragment is present.
    // However, we should check if user is authenticated or has a recovery code.
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, they might have tapped link but not exchanged yet?
                // Usually Next.js middleware or client component init handles this.
                // For now, assume if they land here via link, session is active or setting password works via updateUser.

                // If totally no session, might redirect to login if not 'recovery' flow.
                // But let's let them try to submit, if fails, we tell them link expired.
            }
        };
        checkSession();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('パスワードが一致しません');
            return;
        }

        if (password.length < 6) {
            toast.error('パスワードは6文字以上で設定してください');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('Password update error:', error);
                toast.error('パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
            toast.success('パスワードを更新しました');

        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('予期しないエラーが発生しました');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">更新完了</h2>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">
                            パスワードの再設定が完了しました。<br />
                            新しいパスワードでログインしてください。
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link
                            href="/login"
                            className="inline-block w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-700 transition-colors"
                        >
                            ログイン画面へ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">新しいパスワードの設定</h1>
                    <p className="text-slate-400 font-bold text-sm mt-2">新しいパスワードを入力してください</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">新しいパスワード</label>
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
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">新しいパスワード（確認）</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'パスワードを更新'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
