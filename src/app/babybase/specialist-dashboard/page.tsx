"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import {
    Layout, Users, Calendar, MessageSquare,
    ChevronRight, CheckCircle2, History, TrendingUp,
    Settings, LogOut, Search, Filter, Baby, Heart
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SpecialistDashboard() {
    const { bbSpecialists } = useAppStore();
    const currentSpecialist = bbSpecialists[0]; // Simulated logged in specialist

    // Mock Service History
    const serviceHistory = [
        { id: 'h1', momName: '佐藤 結衣', childName: 'ひなた', service: '母乳相談・マッサージ', date: '2026-01-19', status: '完了' },
        { id: 'h2', momName: '高橋 奈々', childName: 'りく', service: '育児カウンセリング', date: '2026-01-18', status: '完了' },
        { id: 'h3', momName: '田中 理恵', childName: 'めい', service: '産後ケア訪問', date: '2026-01-15', status: '完了' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar (Desktop) / Bottom Nav (Mobile Simulation) */}
            <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500 rounded-2xl flex items-center justify-center">
                        <Baby size={24} />
                    </div>
                    <div>
                        <h1 className="font-black tracking-tight">Baby Base</h1>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Expert Panel</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: '概要', icon: Layout, active: true },
                        { label: '予約・顧客一覧', icon: Users },
                        { label: '提供履歴', icon: History },
                        { label: 'メッセージ', icon: MessageSquare },
                        { label: 'イベント管理', icon: Calendar },
                    ].map(item => (
                        <button key={item.label} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-colors ${item.active ? 'bg-white/10 text-pink-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-white/10 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-slate-400 hover:text-white transition-colors">
                        <Settings size={18} /> 設定
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black text-red-400 hover:text-red-300 transition-colors">
                        <LogOut size={18} /> ログアウト
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 space-y-8 overflow-y-auto">
                {/* Specialist Profile Bar */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 border border-slate-100">
                    <img src={currentSpecialist.image} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-slate-50 shadow-lg" alt="" />
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="bg-pink-100 text-pink-600 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest">{currentSpecialist.category}</span>
                            <CheckCircle2 size={16} className="text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{currentSpecialist.name}</h2>
                        <p className="text-sm font-bold text-slate-400">{currentSpecialist.title}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 min-w-[100px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今月の売上</p>
                            <p className="text-xl font-black text-slate-800">¥128,000</p>
                        </div>
                        <div className="text-center bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 min-w-[100px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">提供数</p>
                            <p className="text-xl font-black text-slate-800">18 件</p>
                        </div>
                    </div>
                </div>

                {/* Service History Table */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3 italic">
                            <History className="text-pink-500" size={24} /> SERVICE HISTORY
                        </h3>
                        <div className="flex gap-2">
                            <div className="relative border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2">
                                <Search size={14} className="text-slate-400" />
                                <input type="text" placeholder="氏名で検索..." className="border-none bg-transparent text-xs font-bold focus:ring-0 p-0" />
                            </div>
                            <button className="bg-slate-100 p-2 rounded-xl text-slate-400"><Filter size={18} /></button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Mom & Child</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Service Content</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Date</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Status</th>
                                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {serviceHistory.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-5 px-4 font-black">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500"><Heart size={16} /></div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{entry.momName}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">子：{entry.childName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="text-xs font-bold text-slate-600">{entry.service}</span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="text-xs font-black text-slate-400">{entry.date}</span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                                                {entry.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <button className="text-slate-300 hover:text-slate-800 transition-colors">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Engagement Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
                        <div className="absolute right-[-10%] top-[-10%] opacity-20"><TrendingUp size={140} /></div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-lg font-black uppercase tracking-tight italic">Expert Tip #03</h3>
                            <p className="font-bold leading-relaxed text-indigo-100">
                                プロフィールに「産後のメンタルケア」に関する具体的なエピソードを追加すると、相談率が15%向上する傾向があります。
                            </p>
                            <button className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-xl text-[10px] font-black hover:bg-white/30 transition-all uppercase tracking-widest">
                                Update Profile
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-center text-center">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mx-auto mb-2">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="font-black text-slate-800">ママたちとお話ししませんか？</h3>
                        <p className="text-xs text-slate-400 font-bold px-4">現在、あなたに関連する悩みを持ったママが3人「AI案内所」を利用しています。</p>
                        <button className="bg-slate-900 text-white py-3 rounded-2xl font-black text-xs hover:bg-pink-500 transition-all shadow-lg active:scale-95">
                            AI案内所のログを表示
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
