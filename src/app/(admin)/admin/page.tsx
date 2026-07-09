'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MdPeople, MdWork, MdDescription, MdCardMembership, MdPendingActions,
  MdBusinessCenter, MdTrendingUp, MdPersonSearch
} from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/Common/PageHeader';
import StatCard from '@/components/admin/DashboardCards/StatCard';
import { staggerCards, fadeInSections } from '@/lib/animations';
import { api } from '@/lib/adminApi';
import './Dashboard.css';

export default function DashboardPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.stat-card');
      staggerCards(cards as any);
    }
    if (!loading && sectionsRef.current) {
      const sections = sectionsRef.current.querySelectorAll('.dashboard-section');
      fadeInSections(sections as any);
    }
  }, [loading]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Loading..." breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Dashboard' }]} />
        <div className="dashboard-loading">Loading dashboard metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Error" breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Dashboard' }]} />
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const statsData = [
    {
      icon: FiUsers, title: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', change: '', positive: true, color: 'blue' as const,
      progress: Math.min(100, (stats?.totalUsers || 0) * 2),
    },
    {
      icon: MdPersonSearch, title: 'Job Seekers', value: (stats?.roleCounts?.job_seeker || 0).toLocaleString(), change: '', positive: true, color: 'cyan' as const,
      progress: stats?.totalUsers ? Math.round(((stats.roleCounts?.job_seeker || 0) / stats.totalUsers) * 100) : 0,
    },
    {
      icon: MdBusinessCenter, title: 'Employers', value: (stats?.roleCounts?.job_poster || 0).toLocaleString(), change: '', positive: true, color: 'purple' as const,
      progress: stats?.totalUsers ? Math.round(((stats.roleCounts?.job_poster || 0) / stats.totalUsers) * 100) : 0,
    },
    {
      icon: MdTrendingUp, title: 'Business Owners', value: (stats?.roleCounts?.business_promoter || 0).toLocaleString(), change: '', positive: true, color: 'green' as const,
      progress: stats?.totalUsers ? Math.round(((stats.roleCounts?.business_promoter || 0) / stats.totalUsers) * 100) : 0,
    },
  ];

  const statsRow2 = [
    {
      icon: MdWork, title: 'Total Jobs', value: stats?.totalJobs?.toLocaleString() || '0', change: `${stats?.activeJobs || 0} active`, positive: true, color: 'blue' as const,
      progress: stats?.totalJobs ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0,
    },
    {
      icon: MdDescription, title: 'Applications', value: stats?.totalApplications?.toLocaleString() || '0', change: '', positive: true, color: 'cyan' as const,
      progress: 65,
    },
    {
      icon: MdCardMembership, title: 'Active Subscriptions', value: stats?.activeSubscriptions?.toLocaleString() || '0', change: '', positive: true, color: 'purple' as const,
      progress: 50,
    },
    {
      icon: MdPendingActions, title: 'Pending Promotions', value: stats?.pendingPromotions?.toLocaleString() || '0', change: 'needs review', positive: false, color: 'orange' as const,
      progress: 30,
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview — live metrics from your Job Portal." breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Dashboard' }]} />
      <div className="dashboard-stats-grid" ref={cardsRef}>
        {statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>
      <div className="dashboard-stats-grid">
        {statsRow2.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>
      <div className="dashboard-content-grid" ref={sectionsRef}>
        <div className="dashboard-section">
          <div className="dashboard-section-title">
            Recent Users
            <span className="view-all" onClick={() => router.push('/admin/users')}>View All</span>
          </div>
          <ul className="activity-list">
            {(stats?.recentUsers || []).map((user: any) => (
              <li key={user.id} className="activity-item">
                <div className="activity-icon blue"><MdPeople /></div>
                <div className="activity-content">
                  <div className="activity-text"><strong>{user.email}</strong></div>
                  <div className="activity-time">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <li className="activity-item"><div className="activity-content">No users yet.</div></li>
            )}
          </ul>
        </div>
        <div className="dashboard-section">
          <div className="dashboard-section-title">
            Recent Job Posts
            <span className="view-all" onClick={() => router.push('/admin/jobs')}>View All</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead><tr><th>Title</th><th>Company</th><th>Status</th><th>Posted</th></tr></thead>
              <tbody>
                {(stats?.recentJobs || []).map((job: any) => (
                  <tr key={job.id}>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{job.title}</span></td>
                    <td>{job.companyName || '—'}</td>
                    <td><span className={`order-status ${job.isActive ? 'completed' : 'cancelled'}`}>{job.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ color: 'var(--gray-500)' }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!stats?.recentJobs || stats.recentJobs.length === 0) && (
                  <tr><td colSpan={4} className="text-center">No jobs posted yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
