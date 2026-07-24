"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardTopHeader from '@/components/Dashboard/DashboardTopHeader';
import '@/components/Dashboard/Dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggedIn, activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      } else {
        const hasValidRole = user?.roles?.some(r => [1, 2, 3].includes(r));
        if (!hasValidRole) {
          router.push('/');
        }
      }
    }
  }, [user, isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn || !user?.roles?.some(r => [1, 2, 3].includes(r))) {
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
      <DashboardSidebar activeRole={activeRole} />
      <main className="dashboard-main" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <DashboardTopHeader />
        {children}
      </main>
    </div>
  );
}

