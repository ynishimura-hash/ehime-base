"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Search, Film, Heart, GraduationCap, FileEdit, UserCircle, LogOut, LogIn, Menu, MessageCircle, Map, Briefcase, TrendingUp, User, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import MobileBottomNav from './MobileBottomNav';
import ScrollToTop from './ScrollToTop';
import DebugRoleSwitcher from './debug/DebugRoleSwitcher';

interface NavItem {
    name: string;
    icon: any;
    href: string;
    badge?: number;
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { users, currentUserId, chats, authStatus, activeRole, logout } = useAppStore();

    const isAdmin = activeRole === 'admin';

    const currentUser = users.find(u => u.id === currentUserId);
    const isAuthenticated = authStatus === 'authenticated';

    const router = React.useMemo(() => {
        // We can't use useRouter here easily if we want to trigger it from the sidebar without moving logic,
        // but we can just use Link for most things.
    }, []);

    // Navigation items filtered by auth status
    const allNavItems: NavItem[] = [
        { name: 'クエスト情報', icon: Map, href: '/quests' },
        { name: '動画で探す', icon: Film, href: '/reels' },
        { name: '企業情報', icon: Building2, href: '/companies' },
        { name: '求人情報', icon: Briefcase, href: '/jobs' },
        { name: '気になるリスト', icon: Heart, href: '/saved' },
        { name: 'メッセージ', icon: MessageCircle, href: '/messages', badge: undefined }, // Badge handled below
        { name: 'e-ラーニング', icon: GraduationCap, href: '/reskill' },
        { name: '進捗確認', icon: TrendingUp, href: '/progress' },
        { name: 'マイページ', icon: User, href: '/mypage' },
        { name: '管理者画面', icon: ShieldCheck, href: '/admin' },
    ];

    const authOnlyRoutes = ['/saved', '/messages', '/progress', '/mypage'];

    const navItems = allNavItems.filter(item => {
        if (!isAuthenticated && authOnlyRoutes.includes(item.href)) return false;
        if (item.href === '/admin' && !isAdmin) return false;
        return true;
    });

    // Update message badge
    const messageItem = navItems.find(n => n.href === '/messages');
    if (messageItem && isAuthenticated) {
        const unreadCount = chats
            .filter(c => c.userId === currentUserId || c.companyId === currentUserId)
            .reduce((acc, chat) => acc + chat.messages.filter(m => m.senderId !== currentUserId && !m.isRead).length, 0);
        if (unreadCount > 0) messageItem.badge = unreadCount;
    }

    // Check if we are in Company Dashboard or Baby Base
    const isCompanyDashboard = pathname?.startsWith('/dashboard/company');
    const isBabyBase = pathname?.startsWith('/babybase');
    const isPublicPage = pathname === '/' || pathname === '/welcome' || pathname?.startsWith('/login');

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    const handleLogout = () => {
        logout();
        window.location.href = '/'; // Simple hard redirect for logout
    };

    // メニュー項目（PC/モバイル共通）
    const renderNavItems = (onClick?: () => void) => (
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClick}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)) ? 'bg-zinc-100 text-eis-navy' : 'text-zinc-500 hover:bg-zinc-50'
                        }`}
                >
                    <item.icon size={20} />
                    {item.name}
                    {mounted && item.badge && (
                        <span className="absolute right-4 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            {item.badge}
                        </span>
                    )}
                </Link>
            ))}
        </nav>
    );

    if (isCompanyDashboard || isPublicPage || isBabyBase) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
            {/* PC Sidebar */}
            <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col h-screen sticky top-0">
                <div className="p-8 border-b border-zinc-100">
                    <Link href="/" className="w-full flex justify-center items-center group">
                        <img src="/eis_logo_mark.png" alt="EIS Logo" className="h-10 w-auto group-hover:opacity-80 transition-opacity" />
                        <span className="font-black text-eis-navy text-xl ml-2 tracking-tighter group-hover:text-blue-600 transition-colors">Ehime Base</span>
                    </Link>
                </div>

                {renderNavItems()}

                <div className="px-4 pb-4">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-eis-navy rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <LogOut size={20} />
                            ログアウト
                        </button>
                    ) : (
                        <Link
                            href="/welcome"
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <LogIn size={20} />
                            ログイン
                        </Link>
                    )}
                </div>

                {isAuthenticated && currentUser && (
                    <div className="p-4 border-t border-zinc-100 mt-auto bg-zinc-50/50">
                        <Link href="/mypage" className="flex items-center gap-3 px-2 py-2 hover:bg-white rounded-xl transition-all group">
                            <img
                                src={currentUser?.image || 'https://via.placeholder.com/40'}
                                alt={currentUser?.name}
                                className="w-10 h-10 rounded-full object-cover border border-zinc-200 shadow-sm"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-700 group-hover:text-blue-600">{currentUser?.name}</span>
                                <span className="text-[10px] text-zinc-400 font-bold">{currentUser?.university || 'EIS User'}</span>
                            </div>
                        </Link>
                    </div>
                )}
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6 sticky top-0 z-50">
                <button onClick={() => setIsMenuOpen(true)}>
                    <Menu className="text-zinc-600" />
                </button>
                <Link href="/" className="flex items-center">
                    <img src="/eis_logo_mark.png" alt="EIS Logo" className="h-8 w-auto" />
                    <span className="font-black text-eis-navy text-lg ml-2 tracking-tighter">Ehime Base</span>
                </Link>
                <div className="w-6" /> {/* balance */}
            </header>

            {/* Mobile Side Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMenuOpen(false)}
            >
                <div
                    className={`absolute left-0 top-0 bottom-0 w-64 bg-white transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-center">
                        <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                            <img src="/eis_logo_mark.png" alt="EIS Logo" className="h-8 w-auto" />
                            <span className="font-black text-eis-navy text-lg ml-2 tracking-tighter">Ehime Base</span>
                        </Link>
                    </div>
                    {renderNavItems(() => setIsMenuOpen(false))}

                    <div className="px-4 pb-4">
                        {isAuthenticated ? (
                            <button
                                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-eis-navy rounded-xl"
                            >
                                <LogOut size={20} />
                                ログアウト
                            </button>
                        ) : (
                            <Link
                                href="/welcome"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl"
                            >
                                <LogIn size={20} />
                                ログイン
                            </Link>
                        )}
                    </div>

                    {isAuthenticated && currentUser && (
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                            <Link href="/mypage" className="flex items-center gap-3 px-2 py-2" onClick={() => setIsMenuOpen(false)}>
                                <img
                                    src={currentUser?.image || 'https://via.placeholder.com/40'}
                                    alt={currentUser?.name}
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-zinc-700">{currentUser?.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-bold">{currentUser?.university || 'EIS User'}</span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 pb-24 md:pb-0 min-h-screen">
                {children}
            </main>

            <ScrollToTop />
            {/* Mobile Bottom Nav */}
            <MobileBottomNav />
            {isAdmin && <DebugRoleSwitcher />}
        </div>
    );
}
