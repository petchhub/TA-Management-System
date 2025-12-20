import React, { createContext, useContext, useState, useEffect } from 'react';
import { decodeJWT } from '../services/authService';

export type UserRole = 'STUDENT' | 'PROFESSOR' | 'FINANCE' | 'ADMIN' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pic?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  login: (user: User) => void;
  logout: () => void;
  hasRole: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in by verifying token
    const checkAuth = async () => {
      try {
        // First, try to get user from backend /auth/me endpoint
        const response = await fetch('/TA-management/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          // Ensure role is included
          if (userData) {
            setUser({
              id: userData.id || userData.sub || '',
              email: userData.email || '',
              name: userData.name || '',
              role: (userData.role?.toUpperCase() as UserRole) || null,
              pic: userData.pic,
            });
          }
          return;
        }

        // If /auth/me fails, try to decode JWT from cookie
        const jwtUser = decodeJWT();
        if (jwtUser) {
          setUser(jwtUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Try fallback JWT decoding
        try {
          const jwtUser = decodeJWT();
          if (jwtUser) {
            setUser(jwtUser);
          }
        } catch (decodeError) {
          console.error('JWT decode failed:', decodeError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Call logout endpoint if available
      await fetch('/TA-management/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const hasRole = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    role: user?.role || null,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
