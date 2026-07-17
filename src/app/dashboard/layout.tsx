"use client";
import React, { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import DashboardRoleTabs from '@/components/Dashboard/DashboardRoleTabs';
import '@/components/Dashboard/Dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const dashboardRoles = user?.roles?.filter(r => [1, 2, 3].includes(r)) || [];
  const primaryRole = dashboardRoles[0] || 1;
  const activeRole = Number(searchParams.get('role')) || primaryRole;

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

  const handleRoleSwitch = (roleId: number) => {
    router.push(`/dashboard?role=${roleId}`);
  };

  if (isLoading || !isLoggedIn || !user?.roles?.some(r => [1, 2, 3].includes(r))) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const isMainDashboard = pathname === '/dashboard';

  return (
    <div className="dashboard-layout">
      <DashboardSidebar activeRole={activeRole} />
      <main className="dashboard-main" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
