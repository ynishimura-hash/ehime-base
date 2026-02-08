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
    Eye,
    GraduationCap,
    UserCheck,  // 講師管理用
    Scroll,     // 監査ログ用
    Building2,  // 企業管理用
    Video       // 動画管理用
} from 'lucide-react';
import { useAppStore } from '@/lib/appStore';

const sidebarItems = [
    { name: 'ダッシュボード', icon: LayoutDashboard, href: '/admin' },
    { name: 'ユーザー管理', icon: Users, href: '/admin/users' },
    { name: 'データ管理', icon: Database, href: '/admin/management' },
    { name: 'e-ラーニング', icon: GraduationCap, href: '/admin/elearning' },
    { name: '企業承認申請', icon: ShieldCheck, href: '/admin/approvals' },
    { name: '講師管理', icon: UserCheck, href: '/admin/instructors' },
    { name: '組織アカウント発行', icon: Building2, href: '/admin/organizations/register' },
    { name: 'アクションログ', icon: Scroll, href: '/admin/audit' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const { logout, activeRole } = useAppStore();
    const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const checkAdminAccess = async () => {
            try {
                // APIで管理者チェック（サービスロール使用、RLSバイパス）
                const response = await fetch('/api/admin/check-access', {
                    method: 'GET',
                });

                if (!isMounted) return;

                const result = await response.json();
                console.log('Admin check result:', result);

                if (result.isAdmin) {
                    setIsAuthorized(true);
                } else {
                    console.log('Not admin, redirecting to /');
                    window.location.replace('/');
                }
            } catch (error) {
                console.error('Admin access check failed:', error);
                if (isMounted) {
                    window.location.replace('/');
                }
            }
        };

        checkAdminAccess();

        return () => {
            isMounted = false;
        };
    }, []);

    React.useEffect(() => {
        // Strict Auth Guard for admin password (2段階目の認証)
        const checkAuth = () => {
            const isHydrated = useAppStore.persist?.hasHydrated ? useAppStore.persist.hasHydrated() : true;

            if (isHydrated && activeRole !== 'admin') {
                // Only redirect if on a child page AND not authenticated as admin
                // Allow /admin page itself (the login page) to render
                if (pathname !== '/admin') {
                    setTimeout(() => {
                        const currentRole = useAppStore.getState().activeRole;
                        if (currentRole !== 'admin') {
                            window.location.replace('/admin');
                        }
                    }, 100);
                }
            }
        };

        if (isAuthorized) {
            checkAuth();
        }
    }, [activeRole, pathname, isAuthorized]);

    const [isStoreLoaded, setIsStoreLoaded] = React.useState(false);
    React.useEffect(() => {
        setIsStoreLoaded(true);
    }, []);

    // 認証チェック中またはハイドレーション待ち
    if (!isStoreLoaded || isAuthorized === null) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">認証を確認中...</p>
                </div>
            </div>
        );
    }

    // 未認可の場合（リダイレクト中）
    if (!isAuthorized) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        window.location.replace('/');
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
