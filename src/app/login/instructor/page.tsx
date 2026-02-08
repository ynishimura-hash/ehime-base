"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function InstructorLoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const { authStatus } = useAppStore();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const checkSession = async () => {
            if (authStatus === 'authenticated') {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        // 既にログイン済みの場合は講師ダッシュボードへ
                        window.location.href = '/dashboard/instructor';
                    } else {
                        useAppStore.getState().resetState();
                    }
                } catch (e) { }
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

            // AppStoreの状態を更新
            const loginAs = useAppStore.getState().loginAs;
            loginAs('instructor', undefined, data.user.id);

            toast.success('講師としてログインしました');
            window.location.href = '/dashboard/instructor';
        } catch (error) {
            toast.error('エラーが発生しました');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 space-y-8 border-t-4 border-indigo-500">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">講師ログイン</h1>
                    <p className="text-slate-500 text-sm">インストラクター専用マイページ</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-indigo-400 transition-colors"
                            placeholder="instructor@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">パスワード</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-indigo-400 transition-colors pr-12"
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

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'ログイン'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <button
                    onClick={() => router.push('/')}
                    className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                >
                    ホームに戻る
                </button>
            </div>
        </div>
    );
}
