"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col">
            {/* Visual Header */}
            <div className="bg-slate-900 pt-20 pb-20 px-6 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"></div>

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                        Ehime Base ログイン
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base font-bold max-w-2xl mx-auto">
                        ログインするアカウントの種類を選択してください
                    </p>
                </div>

                <div className="absolute top-6 left-6 z-20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white/50 hover:text-white font-bold transition-colors bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <span className="text-xs">← トップへ戻る</span>
                    </Link>
                </div>
            </div>

            {/* Selection Cards */}
            <div className="flex-1 -mt-10 px-6 pb-20 relative z-20">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">

                    {/* Seeker Card */}
                    <div
                        onClick={() => router.push('/login/seeker')}
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-slate-100"
                    >
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User size={28} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">学生・求職者の方</h2>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8">
                            マイページへログインし、<br />クエストや企業の検索を行います。
                        </p>
                        <button className="w-full bg-slate-900 text-white font-bold py-3 text-sm rounded-xl group-hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                            ログインへ進む
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Company Card */}
                    <div
                        onClick={() => router.push('/login/company')}
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-slate-100"
                    >
                        <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Building2 size={28} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">企業・パートナーの方</h2>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8">
                            管理画面へログインし、<br />求人の掲載や候補者の管理を行います。
                        </p>
                        <button className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 text-sm rounded-xl group-hover:border-slate-400 group-hover:text-slate-800 transition-colors flex items-center justify-center gap-2">
                            ログインへ進む
                            <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
            </div>

            <div className="py-8 text-center bg-slate-50 border-t border-slate-200/50">
                <p className="text-[10px] font-bold text-slate-400">
                    © 2026 Ehime Base Project. All rights reserved.
                </p>
            </div>
        </div>
    );
}
