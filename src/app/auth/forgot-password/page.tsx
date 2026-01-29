"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Determine the redirect URL based on environment
            const redirectUrl = `${window.location.origin}/auth/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                console.error('Password reset error:', error);

                // Friendly error handling
                if (error.message.includes("Too many requests")) {
                    toast.error("リクエスト回数が多すぎます。しばらく時間をおいてから再度お試しください。");
                } else {
                    toast.error("メールの送信に失敗しました。メールアドレスを確認してください。");
                }
                setLoading(false);
                return;
            }

            // Success regardless of whether user exists (security best practice, though Supabase might throw)
            setSubmitted(true);
            setLoading(false);

        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error("エラーが発生しました。");
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">送信しました</h2>
                        <p className="text-slate-500 font-bold text-sm leading-relaxed">
                            <span className="text-slate-800">{email}</span> 宛にパスワード再設定用のリンクを送信しました。<br />
                            メールをご確認ください。
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link
                            href="/login"
                            className="inline-block w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-700 transition-colors"
                        >
                            ログイン画面に戻る
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            {/* Back Link */}
            <div className="absolute top-6 left-6">
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
                >
                    <span className="text-xs">← ログインに戻る</span>
                </Link>
            </div>

            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">パスワードをお忘れの方</h1>
                    <p className="text-slate-400 font-bold text-sm mt-2">ご登録のメールアドレスを入力してください</p>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                                <Mail size={16} className="text-blue-500" />
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-bold outline-none focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : '再設定メールを送信'}
                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-[10px] font-bold text-slate-400 mt-8">
                    © 2026 Ehime Base Project
                </p>
            </div>
        </div>
    );
}
