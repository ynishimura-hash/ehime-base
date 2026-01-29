"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layout as DashboardIcon, Briefcase, MessageSquare, Heart, Video, Map, Building2, GraduationCap, TrendingUp, User } from 'lucide-react';
import { clsx } from "clsx";
import { useAppStore } from '@/lib/appStore';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { currentUserId, authStatus } = useAppStore();
    const isAuthenticated = authStatus === 'authenticated';

    const navItems = [
        { name: 'ダッシュボード', href: '/dashboard', icon: DashboardIcon },
        { name: 'クエスト', href: '/quests', icon: Map },
        { name: '求人', href: '/jobs', icon: Briefcase },
        { name: '企業', href: '/companies', icon: Building2 },
        { name: '気になる', href: '/saved', icon: Heart },
        { name: 'メッセージ', href: '/messages', icon: MessageSquare },
        { name: '学び', href: '/elearning', icon: GraduationCap },
        { name: '進捗', href: '/progress', icon: TrendingUp },
        { name: 'マイページ', href: '/mypage', icon: User },
    ].filter(item => {
        // Hide restricted items if not logged in
        if (!isAuthenticated) {
            if (item.href === '/dashboard') return false;
            if (item.href === '/elearning') return false; // Hide e-learning if not logged in
            if (['/saved', '/messages', '/progress', '/mypage'].includes(item.href)) return false; // Common auth routes
        }
        return true;
    });

    // Calculate unread messages (mock logic or from store)
    const unreadCount = useAppStore(state =>
        state.chats
            .filter(c => c.userId === currentUserId)
            .reduce((acc, chat) => acc + chat.messages.filter(m => m.senderId !== currentUserId && !m.isRead).length, 0)
    );

    if (pathname?.startsWith('/dashboard')) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 pb-safe z-50">
            <div className="flex overflow-x-auto no-scrollbar px-2 gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center gap-1 p-2 min-w-[64px] relative transition-colors shrink-0 rounded-lg",
                                isActive ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <div className="relative">
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {item.name === 'メッセージ' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center border-2 border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold whitespace-nowrap">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
