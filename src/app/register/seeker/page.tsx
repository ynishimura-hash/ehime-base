"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterSeekerPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: `${lastName} ${firstName}`,
                        user_type: 'student',
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create Profile
                // Note: If you have a Trigger on auth.users to create profiles, this might fail with duplicate key.
                // Assuming manual creation is needed based on RLS "Users can insert their own profile."

                // First check if profile exists (in case trigger created it)
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', authData.user.id)
                    .single();

                if (!existingProfile) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                email: email,
                                last_name: lastName,
                                first_name: firstName,
                                full_name: `${lastName} ${firstName}`,
                                user_type: 'student',
                            }
                        ]);

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        // Don't throw here if auth was successful, just warn. 
                        // User can likely fix profile later or trigger might have raced.
                        toast.warning('アカウントは作成されましたが、プロフィールの保存に失敗しました。');
                    }
                } else {
                    // Update existing profile with details if it was auto-created empty
                    await supabase
                        .from('profiles')
                        .update({
                            email: email,
                            last_name: lastName,
                            first_name: firstName,
                            full_name: `${lastName} ${firstName}`,
                            user_type: 'student',
                        })
                        .eq('id', authData.user.id);
                }

                toast.success('アカウントを作成しました！', {
                    description: 'ログインしてDashboardへ移動します。'
                });

                // Slight delay to ensure auth state propagates or toast is seen
                setTimeout(() => {
                    router.push('/babybase');
                    router.refresh();
                }, 1000);
            }

        } catch (error: any) {
            console.error('Registration Error:', error);
            toast.error('登録に失敗しました', {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-pink-100/50 p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-black text-slate-800">アカウント作成 (学生/求職者)</h1>
                    <p className="text-sm font-bold text-slate-400">新しいキャリアの第一歩を踏み出しましょう</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">姓 (Last Name)</label>
                                <input
                                    type="text"
                                    required
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                                    placeholder="山田"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">名 (First Name)</label>
                                <input
                                    type="text"
                                    required
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                                    placeholder="太郎"
                                />
                            </div>
                        </div>

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
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
                                    placeholder="6文字以上"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-70 shadow-lg shadow-pink-200"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'アカウントを作成して始める'}
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">
                        すでにアカウントをお持ちの方は
                        <Link href="/login" className="ml-2 text-pink-500 hover:text-pink-600 font-black hover:underline transition-all">
                            ログイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
