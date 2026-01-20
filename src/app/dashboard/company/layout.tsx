"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    Briefcase,
    Users,
    MessageSquare,
    LogOut,
    Menu
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

const sidebarItems = [
    { name: 'ダッシュボード', icon: LayoutDashboard, href: '/dashboard/company' },
    { name: '企業情報編集', icon: Building2, href: '/dashboard/company/profile' },
    { name: '求人・クエスト管理', icon: Briefcase, href: '/dashboard/company/jobs/new' }, // Simplified: just go to new/list for now
    { name: 'スカウト', icon: Users, href: '/dashboard/company/scout' },
    { name: 'メッセージ', icon: MessageSquare, href: '/dashboard/company/messages' },
];

export default function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { logout } = useAppStore();

    const isMessagesPage = pathname?.startsWith('/dashboard/company/messages');

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className="h-screen overflow-hidden bg-slate-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 shrink-0">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <span className="text-eis-yellow">⚡️</span> EIS Business
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${pathname === item.href
                                ? 'bg-eis-yellow text-slate-900'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-left"
                    >
                        <LogOut size={18} />
                        ログアウト
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="md:hidden h-16 bg-slate-900/95 text-white flex items-center justify-between px-6 backdrop-blur-md shrink-0">
                    <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <span className="text-eis-yellow">⚡️</span> EIS Biz
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu />
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-40 bg-slate-900 pt-20 px-6 space-y-4">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 py-3 text-white font-bold border-b border-slate-800"
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 py-3 text-slate-400 font-bold mt-8 text-left"
                        >
                            <LogOut size={20} />
                            ログアウト
                        </button>
                    </div>
                )}

                <main className={`flex-1 overflow-y-auto ${isMessagesPage ? 'p-0' : 'p-4 md:p-8'}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}
