"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Layout as DashboardIcon, Building2, Search, Film, Heart, GraduationCap, FileEdit, UserCircle, LogOut, LogIn, Menu, MessageCircle, Map, Briefcase, TrendingUp, User, ShieldCheck, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import MobileBottomNav from './MobileBottomNav';
import ScrollToTop from './ScrollToTop';
import { getFallbackAvatarUrl } from '@/lib/avatarUtils';
import { createClient } from '@/utils/supabase/client';

interface NavItem {
    name: string;
    icon: any;
    href: string;
    badge?: number;
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { users, interactions, currentUserId, chats, authStatus, activeRole, logout } = useAppStore();

    const isAdmin = activeRole === 'admin';

    const currentUser = users.find(u => u.id === currentUserId);
    const isAuthenticated = authStatus === 'authenticated';

    const router = useRouter();

    // Navigation items filtered by auth status
    const allNavItems: NavItem[] = [
        { name: 'クエスト情報', icon: Map, href: '/quests' },
        { name: '動画で探す', icon: Film, href: '/reels' },
        { name: '企業情報', icon: Building2, href: '/companies' },
        { name: '求人情報', icon: Briefcase, href: '/jobs' },
        { name: '気になるリスト', icon: Heart, href: '/saved', badge: undefined },
        { name: 'メッセージ', icon: MessageCircle, href: '/messages', badge: undefined }, // Badge handled below
        { name: 'e-ラーニング', icon: GraduationCap, href: '/reskill' },
        { name: '進捗確認', icon: TrendingUp, href: '/progress' },
        { name: 'ダッシュボード', icon: DashboardIcon, href: '/dashboard' },
        { name: 'プロフィール・設定', icon: Settings, href: '/mypage' },
        { name: '管理者画面', icon: ShieldCheck, href: '/admin' },
    ];

    const authOnlyRoutes = ['/saved', '/messages', '/progress', '/mypage', '/dashboard', '/reskill', '/elearning'];

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

    // Update saved/approach badge
    const savedItem = navItems.find(n => n.href === '/saved');
    if (savedItem && isAuthenticated) {
        const approachCount = interactions.filter(i =>
            i.toId === currentUserId && (i.type === 'like_user' || i.type === 'scout') && !i.isRead
        ).length;
        if (approachCount > 0) savedItem.badge = approachCount;
    }

    // Check if we are in Company Dashboard or Baby Base
    const isCompanyDashboard = pathname?.startsWith('/dashboard/company');
    const isAdminDashboard = pathname?.startsWith('/admin');
    const isBabyBase = pathname?.startsWith('/babybase');
    const isPublicPage = pathname === '/' || pathname === '/welcome' || pathname?.startsWith('/login');

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        // Sync logout across tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'eis-app-store-v3') {
                try {
                    // Check if local storage was cleared or auth status changed to unauthenticated
                    // Simple check: if key is removed or value is null/empty
                    if (!e.newValue) {
                        window.location.href = '/';
                    } else {
                        // Deep check if needed, but usually removing the key implies logout
                        const state = JSON.parse(e.newValue);
                        if (state.state?.authStatus === 'unauthenticated' && authStatus === 'authenticated') {
                            window.location.href = '/';
                        }
                    }
                } catch (err) {
                    console.error('Storage sync error:', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [authStatus]);

    React.useEffect(() => {
        // Strict Session Check on Focus/Navigation
        const checkSession = async () => {
            // Only check if we think we are authenticated
            if (authStatus === 'authenticated') {
                const supabase = createClient();
                try {
                    const { data: { session } } = await supabase.auth.getSession();

                    // If no session found server-side, forcing logout
                    if (!session) {
                        console.log('UI: Session invalid on focus/nav, forcing logout');

                        // 1. Reset State
                        await logout();

                        // 2. Clear LocalStorage
                        try {
                            localStorage.removeItem('eis-app-store-v3');
                        } catch (e) { }

                        // 3. Only redirect if on a protected route
                        // Current path check
                        const currentPath = window.location.pathname;
                        const isProtectedRoute = authOnlyRoutes.some(route => currentPath.startsWith(route));

                        if (isProtectedRoute) {
                            window.location.href = '/welcome';
                        } else {
                            // If on public page (like top /), just stay there as guest
                            // The state change (logout) will trigger re-render
                            // Remove router.refresh() to avoid infinite server request loops
                            console.log('Session expired on public page, switching to guest view');
                        }
                    }
                } catch (error: any) {
                    // Ignore AbortError which happens often in dev/strict mode
                    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                        return;
                    }
                    console.error('Session check failed:', error);
                }
            }
        };

        window.addEventListener('focus', checkSession);
        window.addEventListener('visibilitychange', checkSession);
        checkSession(); // Check immediately on mount/nav change

        return () => {
            window.removeEventListener('focus', checkSession);
            window.removeEventListener('visibilitychange', checkSession);
        };
        return () => {
            window.removeEventListener('focus', checkSession);
            window.removeEventListener('visibilitychange', checkSession);
        };
    }, [pathname, authStatus]);

    // Safety check: If authenticated but no user found, fetch users
    React.useEffect(() => {
        if (mounted && authStatus === 'authenticated' && !currentUser && !useAppStore.getState().isFetchingUsers) {
            console.log('LayoutWrapper: Authenticated but no user found, fetching users...');
            useAppStore.getState().fetchUsers();
        }
    }, [mounted, authStatus, currentUser]);

    const handleLogout = async () => {
        console.log('UI: Logout clicked');
        try {
            await logout();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            // Force reload to clear any memory states and go to welcome page
            // Use setTimeout to allow state updates to settle if needed, but usually href is rough.
            // Explicitly clearing local storage here as a safety net before redirect
            try {
                localStorage.removeItem('eis-app-store-v3');
            } catch (e) {
                console.error('Local storage clear failed in UI:', e);
            }
            window.location.href = '/';
        }
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

    if (isCompanyDashboard || isPublicPage || isBabyBase || isAdminDashboard) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
            {/* PC Sidebar */}
            <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-zinc-200 flex-col h-screen sticky top-0">
                <div className="p-8 border-b border-zinc-100">
                    <Link href="/" className="w-full flex justify-center items-center group">
                        <img src="/eis_logo_mark.png" alt="EIS Logo" className="h-10 w-auto group-hover:opacity-80 transition-opacity" />
                        <span className="font-black text-eis-navy text-xl ml-2 tracking-tighter group-hover:text-blue-600 transition-colors">Ehime Base</span>
                    </Link>
                </div>

                {renderNavItems()}

                <div className="px-4 pb-4">
                    {mounted && isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-eis-navy rounded-xl hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                        >
                            <LogOut size={20} />
                            ログアウト
                        </button>
                    ) : mounted ? (
                        <Link
                            href="/welcome"
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <LogIn size={20} />
                            ログイン
                        </Link>
                    ) : (
                        // Placeholder to prevent layout shift during hydration
                        <div className="w-full h-[46px] rounded-xl bg-slate-100 animate-pulse" />
                    )}
                </div>

                {mounted && isAuthenticated && (
                    <div className="p-4 border-t border-zinc-100 mt-auto bg-zinc-50/50">
                        {currentUser ? (
                            <Link href="/mypage" className="flex items-center gap-3 px-2 py-2 hover:bg-white rounded-xl transition-all group">
                                <img
                                    src={currentUser?.image || getFallbackAvatarUrl(currentUser?.id || '', currentUser?.gender)}
                                    alt={currentUser?.name}
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 shadow-sm"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (!target.getAttribute('data-error-tried')) {
                                            target.setAttribute('data-error-tried', 'true');
                                            target.src = getFallbackAvatarUrl(currentUser?.id || '', currentUser?.gender);
                                        } else {
                                            // Hide or keep silhouette if it already failed (local path shouldn't fail though)
                                            target.src = '/images/defaults/default_user_avatar.png';
                                        }
                                    }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-zinc-700 group-hover:text-blue-600">{currentUser?.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-bold">{currentUser?.university || 'EIS User'}</span>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                                <div className="flex flex-col gap-1.5">
                                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                                    <div className="h-2 w-16 bg-slate-200 rounded animate-pulse" />
                                </div>
                            </div>
                        )}
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
                        {mounted && isAuthenticated ? (
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    // Small timeout to allow menu close animation if desired, but better to just logout.
                                    handleLogout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-eis-navy rounded-xl cursor-pointer"
                            >
                                <LogOut size={20} />
                                ログアウト
                            </button>
                        ) : mounted ? (
                            <Link
                                href="/welcome"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl"
                            >
                                <LogIn size={20} />
                                ログイン
                            </Link>
                        ) : (
                            <div className="w-full h-[46px] rounded-xl bg-slate-100 animate-pulse" />
                        )}
                    </div>

                    {mounted && isAuthenticated && (
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                            {currentUser ? (
                                <Link href="/mypage" className="flex items-center gap-3 px-2 py-2" onClick={() => setIsMenuOpen(false)}>
                                    <img
                                        src={currentUser?.image || getFallbackAvatarUrl(currentUser?.id || '', currentUser?.gender)}
                                        alt={currentUser?.name}
                                        className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (!target.getAttribute('data-error-tried')) {
                                                target.setAttribute('data-error-tried', 'true');
                                                target.src = getFallbackAvatarUrl(currentUser?.id || '', currentUser?.gender);
                                            } else {
                                                target.src = '/images/defaults/default_user_avatar.png';
                                            }
                                        }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-zinc-700">{currentUser?.name}</span>
                                        <span className="text-[10px] text-zinc-400 font-bold">{currentUser?.university || 'EIS User'}</span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-3 px-2 py-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                                    <div className="flex flex-col gap-1.5">
                                        <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                                        <div className="h-2 w-16 bg-slate-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 pb-24 md:pb-0 min-h-screen min-w-0">
                {children}
            </main>

            <ScrollToTop />
            {/* Mobile Bottom Nav */}
            <MobileBottomNav />
        </div>
    );
}
