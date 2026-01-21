"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    Database,
    ShieldCheck,
    FileText,
    Eye
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

const sidebarItems = [
    { name: 'ダッシュボード', icon: LayoutDashboard, href: '/admin' },
    { name: 'データ管理 (企業/求人)', icon: Database, href: '/admin/management' },
    { name: '組織アカウント発行', icon: Users, href: '/organizations/register' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { logout } = useAppStore();

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
                        <ShieldCheck className="text-red-500" />
                        <span>EIS Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${pathname === item.href || pathname?.startsWith(item.href) && item.href !== '/admin'
                                ? 'bg-red-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 pb-2">
                    <Link
                        href="/"
                        target="_blank"
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                    >
                        <Eye size={18} />
                        Ehime Baseを見る
                    </Link>
                </div>

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
                        <ShieldCheck className="text-red-500" /> EIS Admin
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
                        <Link
                            href="/"
                            target="_blank"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 py-3 text-slate-400 font-bold border-b border-slate-800"
                        >
                            <Eye size={20} />
                            Ehime Baseを見る
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 py-3 text-slate-400 font-bold mt-8 text-left"
                        >
                            <LogOut size={20} />
                            ログアウト
                        </button>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
