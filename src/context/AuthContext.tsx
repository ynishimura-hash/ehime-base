"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/lib/appStore';

type UserRole = 'seeker' | 'company';

interface AuthContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<UserRole>('seeker');
    const [isLoading, setIsLoading] = useState(true);
    const { loginAs, logout, setAnalysisResults } = useAppStore();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Fetch Profile Data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    // Sync Role (Mock logic for now, default to seeker if not specified)
                    // In real app, might want to set activeRole based on user_type
                    const userRole = profile.user_type === 'company' ? 'company' : 'seeker';
                    setRoleState(userRole);

                    // Update AppStore
                    loginAs(userRole, session.user.id);

                    // Sync Analysis Resuls
                    if (profile.diagnosis_result) {
                        console.log('Syncing diagnosis result:', profile.diagnosis_result);
                        setAnalysisResults(profile.diagnosis_result);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                logout();
                setRoleState('seeker');
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        localStorage.setItem('ehime-base-debug-role', newRole);
    };

    return (
        <AuthContext.Provider value={{ role, setRole, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
