"use client";

import Link from 'next/link';
import { User, Building2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#FFFBF0] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                        アカウントを作成
                    </h1>
                    <p className="text-slate-500 font-bold">
                        Ehime Base / Baby Base へようこそ。<br className="md:hidden" />
                        登録するアカウントの種類を選択してください。
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Student / Job Seeker */}
                    <Link
                        href="/register/seeker"
                        className="group relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-pink-100/50 hover:shadow-2xl hover:shadow-pink-200/50 hover:-translate-y-1 transition-all border border-transparent hover:border-pink-100"
                    >
                        <div className="absolute top-8 right-8 bg-pink-50 text-pink-500 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowRight size={24} />
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                <User size={32} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">
                                    求職者 / 学生の方
                                </h2>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed">
                                    自分のペースで成長できる。<br />
                                    スキルを磨いて、理想のキャリアを見つけよう。
                                </p>
                            </div>
                            <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                                    AIによる自己分析・キャリア診断
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                                    eラーニングでスキルアップ
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                                    企業からのオファー・スカウト
                                </li>
                            </ul>
                        </div>
                    </Link>

                    {/* Company */}
                    <Link
                        href="/organizations/register"
                        className="group relative bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all border border-transparent hover:border-blue-100"
                    >
                        <div className="absolute top-8 right-8 bg-blue-50 text-blue-500 w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowRight size={24} />
                        </div>
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Building2 size={32} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-800">
                                    企業・採用担当の方
                                </h2>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed">
                                    求める人材と、確かなマッチング。<br />
                                    成長意欲の高い人材に出会えます。
                                </p>
                            </div>
                            <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    求人・クエストの掲載
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    ダイレクトリクルーティング
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                    学習歴・実践スキルによる選考
                                </li>
                            </ul>
                        </div>
                    </Link>
                </div>

                <div className="text-center">
                    <p className="text-sm font-bold text-slate-400">
                        すでにアカウントをお持ちの方は
                        <Link href="/login" className="ml-2 text-slate-800 hover:text-black hover:underline transition-all">
                            ログイン
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
