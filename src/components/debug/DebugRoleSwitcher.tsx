"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/appStore';
import { useRouter, usePathname } from 'next/navigation';
import { User, Building2, Monitor, LogOut, ShieldCheck, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DebugRoleSwitcher() {
    const { authStatus, activeRole, loginAs, logout } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'error' | 'idle'>('idle');

    const checkServerStatus = async () => {
        setServerStatus('checking');
        try {
            const res = await fetch('/api/health'); // Assuming there's a health check or just root
            if (res.ok) {
                setServerStatus('online');
                toast.success('Server is online (localhost:3000)');
            } else {
                setServerStatus('error');
                toast.error('Server returned error status');
            }
        } catch (error) {
            console.error('Server check failed:', error);
            setServerStatus('error');
            toast.error('Server is unreachable (localhost:3000)');
        }
    };

    // Auto-sync UI state with Router (Optional safety, mostly relying on Store)
    useEffect(() => {
        // If we are on a dashboard route but authStatus is guest, maybe we should redirect?
        // But for debug flexibility, we might allow viewing if middleware doesn't block it.
        // For now, we trust the manual switcher logic.
    }, [pathname, authStatus]);

    const handleSwitch = (role: 'guest' | 'seeker' | 'company' | 'admin') => {
        if (role === 'guest') {
            logout();
            router.push('/');
        } else if (role === 'seeker') {
            loginAs('seeker');
            router.push('/');
        } else if (role === 'company') {
            loginAs('company');
            router.push('/dashboard/company');
        } else if (role === 'admin') {
            loginAs('admin');
            router.push('/admin');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="pointer-events-auto bg-slate-900 text-white p-3 rounded-full shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2 font-bold text-xs"
            >
                <Monitor size={16} />
                <span className={isExpanded ? '' : 'hidden'}>Debug: {authStatus === 'guest' ? 'Guest' : activeRole === 'seeker' ? 'Seeker' : activeRole === 'company' ? 'Company' : 'Admin'}</span>
            </button>

            {/* Panel */}
            {isExpanded && (
                <div className="pointer-events-auto mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 w-48 space-y-1 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider">Switch Role</p>

                    <button
                        onClick={() => handleSwitch('seeker')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${authStatus === 'authenticated' && activeRole === 'seeker'
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <User size={14} />
                        Job Seeker
                        {authStatus === 'authenticated' && activeRole === 'seeker' && <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />}
                    </button>

                    <button
                        onClick={() => handleSwitch('company')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${authStatus === 'authenticated' && activeRole === 'company'
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <Building2 size={14} />
                        Company
                        {authStatus === 'authenticated' && activeRole === 'company' && <span className="ml-auto w-2 h-2 bg-slate-900 rounded-full" />}
                    </button>

                    <button
                        onClick={() => handleSwitch('admin')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${authStatus === 'authenticated' && activeRole === 'admin'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <ShieldCheck size={14} />
                        Super Admin
                        {authStatus === 'authenticated' && activeRole === 'admin' && <span className="ml-auto w-2 h-2 bg-white rounded-full" />}
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    <button
                        onClick={() => handleSwitch('guest')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${authStatus === 'guest'
                            ? 'bg-red-50 text-red-600'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <LogOut size={14} />
                        Guest / Logout
                        {authStatus === 'guest' && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />}
                    </button>
                    <div className="h-px bg-slate-100 my-1" />

                    <p className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider">System Status</p>
                    <button
                        onClick={checkServerStatus}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        {serverStatus === 'checking' ? (
                            <Activity size={14} className="animate-spin text-blue-500" />
                        ) : serverStatus === 'online' ? (
                            <CheckCircle2 size={14} className="text-green-500" />
                        ) : serverStatus === 'error' ? (
                            <AlertCircle size={14} className="text-red-500" />
                        ) : (
                            <Activity size={14} />
                        )}
                        Check Server
                        {serverStatus === 'online' && <span className="ml-auto text-[10px] text-green-500">Live</span>}
                    </button>
                </div>
            )}
        </div>
    );
}
