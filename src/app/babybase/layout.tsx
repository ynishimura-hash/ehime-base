"use client";

import React from 'react';
import { Layout, Users, BookOpen, Baby } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BabyBaseLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isSpecialistDashboard = pathname?.startsWith('/babybase/specialist-dashboard');

    if (isSpecialistDashboard) {
        return <>{children}</>; // Specialist Dashboard handles its own layout
    }

    return (
        <div className="min-h-screen bg-[#FFFBF0]">
            {children}

            {/* Common Baby Base Bottom Nav (only for non-dashboard pages) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-100 px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-12 z-50">
                <Link href="/babybase" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/babybase' ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}>
                    <Layout size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Top</span>
                </Link>
                <Link href="/babybase/specialists" className={`flex flex-col items-center gap-1 transition-colors ${pathname?.startsWith('/babybase/specialists') ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}>
                    <Users size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Experts</span>
                </Link>
                <Link href="/babybase/learning" className={`flex flex-col items-center gap-1 transition-colors ${pathname?.startsWith('/babybase/learning') ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}>
                    <BookOpen size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Learn</span>
                </Link>
                <Link href="/babybase/register" className={`flex flex-col items-center gap-1 transition-colors ${pathname?.startsWith('/babybase/register') ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}>
                    <div className={`w-5 h-5 rounded-full ${pathname?.startsWith('/babybase/register') ? 'bg-pink-500' : 'bg-slate-200'}`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">My</span>
                </Link>
            </div>
        </div>
    );
}
