"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error('ログインに失敗しました', {
                    description: error.message
                });
                return;
            }

            toast.success('ログインしました');
            router.push('/babybase');
            router.refresh(); // Refresh to update server components
        } catch (err) {
            toast.error('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'line') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google', // currently only google configured in schema/plan, line requires extra setup
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast.error('ソーシャルログインに失敗しました', { description: error.message });
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-black text-slate-800">おかえりなさい！</h1>
                    <p className="text-sm font-bold text-slate-400">Ehime Base / Baby Base アカウントでログイン</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">メールアドレス</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">パスワード</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'ログイン'}
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-slate-300 font-black">または</span>
                    </div>
                </div>

                <button
                    onClick={() => handleSocialLogin('google')}
                    className="w-full bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Googleでログイン
                </button>

                <div className="text-center">
                    <Link href="/babybase/register" className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors">
                        アカウントをお持ちでない方はこちら
                    </Link>
                    <div className="mt-8 pt-4 border-t border-slate-50">
                        <Link href="/admin" className="text-[10px] font-bold text-slate-300 hover:text-slate-400 transition-colors">
                            管理者ログイン
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
