'use client';

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
        // Redirect if already logged in (basic check, precise check is done in handleLogin)
        // Actually for instructor login, we might want to strict check if they are ALREADY instructor.
        // But for now let's just let them re-login or redirect if session exists.
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Auth with Supabase
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

            // 2. Check User Type (Must be instructor or admin)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile) {
                toast.error('プロフィール情報の取得に失敗しました');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (profile.user_type !== 'instructor' && profile.user_type !== 'admin') {
                toast.error('このアカウントには講師権限がありません');
                await supabase.auth.signOut(); // Force logout
                setLoading(false);
                return;
            }

            // 3. Success
            toast.success('講師としてログインしました');

            // AppStoreの状態を更新
            useAppStore.getState().loginAs('instructor', data.user.id);

            window.location.href = '/dashboard/instructor';

        } catch (error) {
            toast.error('予期せぬエラーが発生しました');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">講師ログイン</h1>
                    <p className="text-slate-500 text-sm font-bold">Ehime Base Instructor Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
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
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12 font-bold"
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
                            className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                        >
                            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'ログイン'}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-bold">
                        ※ アカウントをお持ちでない場合は管理者へお問い合わせください
                    </p>
                </div>
            </div>
        </div>
    );
}
