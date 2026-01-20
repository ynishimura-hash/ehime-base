"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, User, Building2 } from 'lucide-react';

export default function DebugAccountSwitcher() {
    const { role, setRole } = useAuth();

    return (
        <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-2 scale-90 origin-bottom-right md:scale-100">
            <div className="bg-white/80 backdrop-blur-md border border-zinc-200 p-2 rounded-2xl shadow-2xl flex flex-col gap-1">
                <div className="px-3 py-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 mb-1">
                    Debug Mode
                </div>

                <button
                    onClick={() => setRole('seeker')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${role === 'seeker'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : 'text-zinc-500 hover:bg-zinc-100'
                        }`}
                >
                    <User size={16} />
                    <span className="text-xs font-bold">求職者</span>
                </button>

                <button
                    onClick={() => setRole('company')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${role === 'company'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'text-zinc-500 hover:bg-zinc-100'
                        }`}
                >
                    <Building2 size={16} />
                    <span className="text-xs font-bold">企業</span>
                </button>

                <div className="mt-1 px-3 py-1 bg-zinc-100 rounded-lg text-[10px] text-zinc-500 text-center font-bold">
                    Role: {role.toUpperCase()}
                </div>
            </div>
        </div>
    );
}
