import EmployerDashboard from '@/views/EmployerDashboard/EmployerDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employer Dashboard | JobNest',
  description: 'Manage your job listings, track applicants, and post new opportunities on JobNest.',
};

export default function EmployerDashboardPage() {
  return <EmployerDashboard />;
}
