"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

export default function WelcomePage() {
    const router = useRouter();
    const { authStatus, activeRole } = useAppStore();

    // If already authenticated, this page doesn't make sense, but we keep it simple for now.

    return (
        <div className="min-h-screen bg-slate-50 relative">
            {/* Visual Header Area */}
            <div className="relative bg-blue-700 pb-32 pt-20 px-6 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-400 rounded-full blur-3xl opacity-30"></div>

                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight pt-10">
                        ログイン・新規登録
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
                        あなたの可能性を広げる、新しい一歩を。
                    </p>
                </div>

                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">トップへ戻る</span>
                    </button>
                </div>
            </div>

            {/* Content Area (Overlapping Cards) */}
            <div className="relative z-20 max-w-5xl mx-auto px-6 -mt-24 pb-20">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Seeker Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:translate-y-[-4px] transition-all group flex flex-col h-full relative overflow-hidden">
                        <div className="item-bg absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-50 to-transparent rounded-bl-[100px] -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110" />

                        <div className="flex-1 cursor-pointer relative z-10" onClick={() => router.push('/login/seeker')}>
                            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-inner">
                                <User size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-cyan-800 transition-colors">学生/社会人の方</h2>
                            <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
                                自分の魅力を発見し、<br />
                                可能性を広げていきましょう。
                            </p>
                        </div>
                        <div className="space-y-3 mt-auto relative z-10">
                            <button
                                onClick={() => router.push('/login/seeker')}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                            >
                                ログイン
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push('/register/seeker'); }}
                                className="w-full bg-white border-2 border-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                まだ登録していない方はこちら
                            </button>
                        </div>
                    </div>

                    {/* Company Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:translate-y-[-4px] transition-all group flex flex-col h-full relative overflow-hidden">
                        <div className="item-bg absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100px] -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110" />

                        <div className="flex-1 cursor-pointer relative z-10" onClick={() => router.push('/login/company')}>
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform shadow-inner">
                                <Building2 size={32} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-blue-700 transition-colors">企業/パートナーの方</h2>
                            <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
                                自社の魅力を動画やクエストで発信し、<br />
                                共感で繋がる仲間を集めましょう。
                            </p>
                        </div>
                        <div className="space-y-3 mt-auto relative z-10">
                            <button
                                onClick={() => router.push('/login/company')}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                            >
                                ログイン
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); router.push('/organizations/register'); }}
                                className="w-full bg-white border-2 border-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                まだ登録していない方はこちら
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-xs font-bold text-slate-400">
                        © 2026 Ehime Base Project. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
