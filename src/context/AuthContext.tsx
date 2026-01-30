"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAppStore, User } from '@/lib/appStore';

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
    const { loginAs, logout, setAnalysisResults, addUser } = useAppStore();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
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

                    // Fetch Company ID if user is company
                    let companyId: string | undefined;
                    if (userRole === 'company') {
                        const { data: orgMember } = await supabase
                            .from('organization_members')
                            .select('organization_id')
                            .eq('user_id', session.user.id)
                            .single();
                        if (orgMember) {
                            companyId = orgMember.organization_id;
                        }
                    }

                    // Update AppStore
                    // Construct User object from profile
                    // Note: Schema doesn't have all fields yet, using defaults for now.
                    const newUser: User = {
                        id: session.user.id,
                        name: profile.full_name || 'Guest',
                        age: 21, // Default
                        university: profile.university || '愛媛大学', // Default or from profile if exists (schema update needed)
                        faculty: '法文学部', // Default
                        bio: '',
                        tags: [],
                        image: profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + session.user.id,
                        isOnline: true,
                    };
                    addUser(newUser);
                    loginAs(userRole, session.user.id, companyId); // Pass companyId

                    // Critical: Fetch all users and companies to ensure AppStore has latest data
                    // This fixes the "Infinite Loading" (missing profile) and "Dummy Admin Data" issues
                    const { fetchUsers, fetchCompanies } = useAppStore.getState();
                    fetchUsers();
                    fetchCompanies();

                    // Sync Analysis Resuls
                    if (profile.diagnosis_result) {
                        console.log('Syncing diagnosis result:', profile.diagnosis_result);
                        setAnalysisResults(profile.diagnosis_result);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                useAppStore.getState().resetState();
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
