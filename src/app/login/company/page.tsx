"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

export default function CompanyLoginPage() {
    const router = useRouter();
    const loginAs = useAppStore(state => state.loginAs);

    const handleLogin = () => {
        loginAs('company');
        toast.success('企業アカウントとしてログインしました');
        router.push('/dashboard/company');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 space-y-8">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">企業ログイン</h1>
                    <p className="text-slate-500 text-sm">採用担当者専用ページ</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                        <input
                            type="email"
                            disabled
                            value="hr@eis.co.jp"
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
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]"
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
