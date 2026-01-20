"use client";

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter, usePathname } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';

export default function RoleSwitcher() {
    const { activeRole, switchRole } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();

    // Prevent hydration mismatch by rendering only after mount
    const [mounted, setMounted] = React.useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const handleSwitch = (newRole: 'seeker' | 'company') => {
        if (activeRole === newRole) return;

        switchRole(newRole);

        if (newRole === 'company') {
            router.push('/dashboard/company');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
            <div className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg border border-slate-700 self-start flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                DEMO MODE
            </div>
            <div className="bg-white/90 backdrop-blur border border-slate-200 p-1.5 rounded-2xl shadow-xl flex gap-1">
                <button
                    onClick={() => handleSwitch('seeker')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeRole === 'seeker'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    求職者 (西村)
                </button>
                <button
                    onClick={() => handleSwitch('company')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeRole === 'company'
                        ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    企業 (EIS)
                </button>
            </div>
        </div>
    );
}
