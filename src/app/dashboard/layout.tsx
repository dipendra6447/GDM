import React from 'react';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import '@/components/Dashboard/Dashboard.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
