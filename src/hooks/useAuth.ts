"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  googleId?: string;
  avatarUrl?: string;
  jobApplyCount: number;
  jobPostCount: number;
  roles: number[];
  profileCompletion?: number;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  updateProfile?: (data: FormData) => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
          // If backend says not authenticated, clear local token
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
    // 1. Check if token is in URL (from Google OAuth redirect)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        // Clean the URL query params
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
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

  const updateProfile = useCallback(async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const endpoint = user?.roles[0] === 1 ? '/api/profiles/job-seeker' : 
                     user?.roles[0] === 2 ? '/api/profiles/employer' : 
                     '/api/profiles/business-promoter';

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to update profile');
    }

    // Refresh user data to get updated profileCompletion
    await fetchUser();
  }, [user, fetchUser]);

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    logout,
    refetch: fetchUser,
    updateProfile,
  };
}
