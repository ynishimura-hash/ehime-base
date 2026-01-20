"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { User } from 'lucide-react';

export default function SeekerLoginPage() {
    const router = useRouter();
    const loginAs = useAppStore(state => state.loginAs);

    const handleLogin = () => {
        loginAs('seeker');
        toast.success('ログインしました');
        router.push('/');
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

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                        <input
                            type="email"
                            disabled
                            value="yuji.nishimura@example.com"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">パスワード</label>
                        <input
                            type="password"
                            disabled
                            value="password"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleLogin}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                    >
                        ログイン (デモ)
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        デモ環境のため、パスワード入力なしでログインできます。
                    </p>
                </div>
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
