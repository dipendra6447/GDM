"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  googleId?: string;
  avatarUrl?: string;
  jobApplyCount: number;
  jobPostCount: number;
  roles: number[];
  profileCompletion?: number;       // averaged across all roles
  profileCompletions?: Record<string, number>; // per-role map e.g. { "1": 60, "2": 30 }
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  activeRole: number;
  switchRole: (roleId: number, redirectUrl?: string) => void;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  updateProfile?: (data: FormData, roleId?: number) => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRoleState] = useState<number>(1);
  const router = useRouter();

  useEffect(() => {
    if (user?.roles?.length) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('activeRole') : null;
      const savedRoleNum = saved ? Number(saved) : null;
      if (savedRoleNum && user.roles.includes(savedRoleNum)) {
        setActiveRoleState(savedRoleNum);
      } else {
        setActiveRoleState(user.roles[0]);
      }
    } else {
      setActiveRoleState(1);
    }
  }, [user]);

  const switchRole = useCallback((roleId: number, redirectUrl?: string) => {
    localStorage.setItem('activeRole', String(roleId));
    setActiveRoleState(roleId);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = '/dashboard';
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.data);
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if token is in URL (from Google OAuth redirect)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    // Single fetch at app root — all consumers share this result
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (formData: FormData, roleId?: number) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prefer explicit roleId; fall back to user's first role
    const effectiveRole = roleId ?? user?.roles[0];
    const endpoint =
      effectiveRole === 1 ? '/api/profiles/job-seeker' :
      effectiveRole === 2 ? '/api/profiles/employer' :
      '/api/profiles/business-promoter';

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      const err = new Error(data.message || 'Failed to update profile') as any;
      err.errors = data.errors;
      throw err;
    }

    // Refresh user data after update
    await fetchUser();
  }, [user, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, activeRole, switchRole, logout, refetch: fetchUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>. Wrap your app with AuthProvider.');
  }
  return ctx;
}
