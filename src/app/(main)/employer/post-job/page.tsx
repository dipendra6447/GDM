import EmployerDashboard from '@/views/EmployerDashboard/EmployerDashboard';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Employer Dashboard | JobNest',
  description: 'Manage your job listings, track applicants, and post new opportunities on JobNest.',
};

export default function EmployerDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading Dashboard...</div>}>
      <EmployerDashboard />
    </Suspense>
  );
}
