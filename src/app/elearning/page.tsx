"use client";

import React, { useState } from 'react';
import { GraduationCap, Lock } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { LoginPromptModal } from '@/components/auth/LoginPromptModal';
import Link from 'next/link';

export default function ELearningPage() {
    const { authStatus } = useAppStore();
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

    const handleAccessAttempt = () => {
        if (authStatus !== 'authenticated') {
            setIsLoginPromptOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div
                onClick={handleAccessAttempt}
                className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full cursor-pointer hover:shadow-lg transition-all"
            >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 relative">
                    <GraduationCap size={32} />
                    {authStatus !== 'authenticated' && (
                        <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <Lock size={14} className="text-white" />
                        </div>
                    )}
                </div>
                <h1 className="text-xl font-black text-slate-800 mb-2">e-ラーニング</h1>
                {authStatus === 'authenticated' ? (
                    <>
                        <p className="text-slate-500 font-bold mb-4">
                            スキルアップのための動画講座「Reskill University」が公開されました！
                        </p>
                        <Link
                            href="/reskill"
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg inline-block"
                        >
                            ダッシュボードを開く
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-slate-600 font-bold mb-2">
                            🔒 ログインして学習コンテンツにアクセス
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                            Ehime Baseの会員限定で、愛媛で働くためのスキルアップ動画講座が利用できます。
                        </p>
                        <button
                            onClick={handleAccessAttempt}
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg"
                        >
                            ログインして始める
                        </button>
                    </>
                )}
            </div>

            <LoginPromptModal
                isOpen={isLoginPromptOpen}
                onClose={() => setIsLoginPromptOpen(false)}
                message="e-ラーニングコンテンツはログイン後にご利用いただけます"
            />
        </div>
    );
}
