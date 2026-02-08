"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, Lock, HelpCircle, LogOut, ChevronRight, User, Shield, Smartphone, Mail } from 'lucide-react';

interface SettingsItem {
    icon: any;
    label: string;
    href: string;
    toggle?: boolean;
    badge?: string;
}

interface SettingsSection {
    title: string;
    items: SettingsItem[];
}

export default function SettingsPage() {
    const router = useRouter();

    const sections: SettingsSection[] = [
        {
            title: 'アカウント設定',
            items: [
                { icon: User, label: 'プロフィール編集', href: '/mypage/edit' },
                { icon: Lock, label: 'パスワードとセキュリティ', href: '/settings/security' },
                { icon: Mail, label: 'メールアドレス変更', href: '/settings/email' },
            ]
        },
        {
            title: '通知設定',
            items: [
                { icon: Bell, label: 'プッシュ通知', href: '#', toggle: true },
                { icon: Smartphone, label: 'SMS通知', href: '#', toggle: false },
            ]
        },
        {
            title: 'サポート・その他',
            items: [
                { icon: HelpCircle, label: 'ヘルプ・よくある質問', href: '/help' },
                { icon: Shield, label: 'プライバシーポリシー', href: '/privacy' },
                { icon: LogOut, label: 'ログアウト', href: '/logout' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-slate-800 text-lg">設定</span>
            </div>

            <div className="p-6 max-w-md mx-auto space-y-8">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">{section.title}</h2>
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {section.items.map((item, idx) => (
                                <div
                                    key={item.label}
                                    onClick={() => {
                                        if (item.toggle) return; // Don't navigate for toggles
                                        if (item.href === '/logout') {
                                            // Handle logout specifically if needed, or just let it go to a logout page/handler
                                            // But for now router.push is fine if /logout exists, but usually we want a handler.
                                            // The user code has a separate Logout button at bottom, so this might be redundant or just a link.
                                            // Let's assume standard navigation for now.
                                            router.push(item.href);
                                        } else if (item.href !== '#') {
                                            router.push(item.href);
                                        }
                                    }}
                                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-slate-50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                            <item.icon size={16} />
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">{item.label}</span>
                                    </div>

                                    {item.toggle ? (
                                        <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {item.badge && (
                                                <span className="text-[10px] bg-red-100 text-red-500 font-bold px-2 py-0.5 rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                            <ChevronRight size={16} className="text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button className="w-full bg-white hover:bg-red-50 text-red-500 font-bold py-4 rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all flex items-center justify-center gap-2">
                    <LogOut size={20} />
                    ログアウト
                </button>
            </div>
        </div>
    );
}
