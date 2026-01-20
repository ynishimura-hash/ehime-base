"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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

    // 初回読み込み時にlocalStorageから取得
    useEffect(() => {
        const savedRole = localStorage.getItem('ehime-base-debug-role') as UserRole;
        if (savedRole) {
            setRoleState(savedRole);
        }
        setIsLoading(false);
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
