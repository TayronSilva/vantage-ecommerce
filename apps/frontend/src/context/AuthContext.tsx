import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: (onLogoutComplete?: () => void) => void;
    isAuthenticated: boolean;
    can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractPermissions = (userData: any): string[] => {
    if (!userData.profiles) return [];
    const perms = userData.profiles.flatMap((p: any) =>
        p.accessProfile?.rules?.map((r: any) => r.slug) || []
    );
    return [...new Set(perms)] as string[];
};

const determinePrimaryRole = (userData: any): any => {
    if (!userData.profiles || userData.profiles.length === 0) return 'CUSTOMER';
    const roles = userData.profiles.map((p: any) => p.accessProfile?.name);
    if (roles.includes('OWNER')) return 'OWNER';
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('MANAGER')) return 'MANAGER';
    return roles[0] || 'CUSTOMER';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const processUser = (userData: any): User => {
        return {
            ...userData,
            role: determinePrimaryRole(userData),
            permissions: extractPermissions(userData)
        };
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const userData = await authService.getMe();
                    setUser(processUser(userData));
                } catch (error) {
                    authService.logout();
                }
            }
            setLoading(false);
        };

        initAuth();

        const handleUnauthorized = () => {
            setUser(null);
        };

        window.addEventListener('auth_unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        await authService.login(credentials);
        const userData = await authService.getMe();
        setUser(processUser(userData));
    };

    const logout = (onLogoutComplete?: () => void) => {
        authService.logout();
        setUser(null);
        if (onLogoutComplete) {
            onLogoutComplete();
        }
    };

    const can = (permission: string): boolean => {
        if (!user) return false;
        return user.permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, can }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
