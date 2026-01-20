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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-b-[60px] z-0" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-20">
                <button
                    onClick={() => router.push('/')}
                    className="mb-8 flex items-center gap-2 text-white/80 hover:text-white font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    トップページに戻る
                </button>

                {/* Hero */}
                <div className="text-center text-white mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-white font-bold text-xs tracking-wider">
                        <Sparkles size={14} />
                        BETA Ver. 0.9
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
                        LOGIN
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl font-bold max-w-2xl mx-auto leading-relaxed">
                        どのような立場でご利用になりますか？
                    </p>
                </div>

                {/* Cards Container */}
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Seeker Card */}
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:scale-[1.02] transition-all border border-slate-100 group cursor-pointer" onClick={() => router.push('/login/seeker')}>
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                            <User size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">求職者の方</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            自分の可能性を広げるクエストに出会い、<br />
                            愛媛での新しい働き方を見つけましょう。
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-black group-hover:gap-4 transition-all">
                            求職者ログイン
                            <ArrowRight size={20} />
                        </div>
                    </div>

                    {/* Company Card */}
                    <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:scale-[1.02] transition-all border border-slate-100 group cursor-pointer" onClick={() => router.push('/login/company')}>
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
                            <Building2 size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">企業の方</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            会社の魅力を動画やクエストで発信し、<br />
                            共感で繋がる仲間を集めましょう。
                        </p>
                        <div className="flex items-center gap-2 text-slate-900 font-black group-hover:gap-4 transition-all">
                            企業ログイン
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
