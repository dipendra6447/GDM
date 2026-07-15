"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import '@/components/Dashboard/Dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      } else if (!user?.roles?.includes(1)) {
        if (user?.roles?.includes(2)) {
          router.push('/employer/post-job');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn || !user?.roles?.includes(1)) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
