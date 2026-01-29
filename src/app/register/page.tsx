"use client";

import Link from 'next/link';
import { User, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
            {/* Visual Area (Left(PC) / Top(Mobile)) */}
            <div className="relative overflow-hidden bg-blue-600 lg:h-auto min-h-[280px] p-8 lg:p-12 flex flex-col justify-between">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-400 rounded-full blur-3xl opacity-30"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
                            <span className="font-black text-xl">E</span>
                        </div>
                        <span className="text-white font-black text-2xl tracking-tight">Ehime Base</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                        さあ、新しい物語を<br />
                        始めよう。
                    </h1>
                    {/* Benefits: Hide on mobile */}
                    <div className="hidden lg:block space-y-4">
                        {[
                            'あなたにぴったりの企業・クエストが見つかる',
                            '学習と実践で、確かなスキルが身につく',
                            '愛媛の未来をつくる仲間と出会える'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-blue-100 font-bold">
                                <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-blue-200 text-sm font-bold hidden lg:block">
                    © 2026 Ehime Base Project. All rights reserved.
                </div>
            </div>

            {/* Right Column: Selection Area */}
            <div className="flex items-center justify-center p-6 sm:p-12 -mt-10 lg:mt-0 relative z-20">
                <div className="w-full max-w-lg space-y-8 bg-white lg:bg-transparent p-8 lg:p-0 rounded-[2rem] lg:rounded-none shadow-xl lg:shadow-none">
                    <div className="text-center space-y-2 lg:text-left">
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-800">アカウント作成</h2>
                        <p className="text-slate-500 font-bold text-sm lg:text-base">
                            登録するアカウントの種類を選択してください
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Student / Job Seeker */}
                        <Link
                            href="/register/seeker"
                            className="group relative bg-white border-2 border-slate-100 hover:border-pink-200 rounded-3xl p-6 transition-all shadow-lg hover:shadow-xl hover:shadow-pink-100 hover:-translate-y-1 flex items-start gap-4"
                        >
                            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0">
                                <User size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-pink-600 transition-colors">求職者 / 学生の方</h3>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                                    キャリア診断やスキル学習を通じて、<br className="hidden sm:block" />
                                    理想のキャリアを見つけよう。
                                </p>
                            </div>
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </Link>

                        {/* Company */}
                        <Link
                            href="/organizations/register"
                            className="group relative bg-white border-2 border-slate-100 hover:border-blue-200 rounded-3xl p-6 transition-all shadow-lg hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-1 flex items-start gap-4"
                        >
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                                <Building2 size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">企業・採用担当の方</h3>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                                    求人掲載からスカウトまで。<br className="hidden sm:block" />
                                    成長意欲の高い人材と出会えます。
                                </p>
                            </div>
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-400">
                            すでにアカウントをお持ちの方は
                            <Link href="/login" className="ml-2 text-blue-600 hover:text-blue-700 font-black hover:underline transition-all">
                                ログイン
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
