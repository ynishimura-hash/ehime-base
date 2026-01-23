"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { User, Loader2, ArrowRight } from 'lucide-react';

export default function SeekerLoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                toast.error(error.message || 'ログインに失敗しました');
                return;
            }

            toast.success('ログインしました');
            router.push('/dashboard');
            router.refresh();
        } catch (error) {
            toast.error('エラーが発生しました');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">求職者ログイン</h1>
                    <p className="text-slate-500 text-sm">Ehime Baseへようこそ</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-slate-400 transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">パスワード</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-slate-400 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'ログイン'}
                        </button>
                    </div>
                </form>
            </div>

            <button
                onClick={() => router.push('/')}
                className="mt-8 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
            >
                ホームに戻る
            </button>
        </div>
    );
}
