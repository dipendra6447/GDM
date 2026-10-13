"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/Dashboard/StatCard';
import ApplicationChart from '@/components/Dashboard/ApplicationChart';
import RecommendedJobCard from '@/components/Dashboard/RecommendedJobCard';
import BusinessPromoterDashboard from '@/components/Dashboard/BusinessPromoterDashboard';
import EmployerDashboard from '@/views/EmployerDashboard/EmployerDashboard';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import AdBanner from '@/components/AdBanner/AdBanner';
import DashboardProfileHero from '@/components/Dashboard/DashboardProfileHero';
import DashboardStatMetrics from '@/components/Dashboard/DashboardStatMetrics';
import DashboardAboutSection from '@/components/Dashboard/DashboardAboutSection';
import DashboardProfileStrength from '@/components/Dashboard/DashboardProfileStrength';
import DashboardRightSidebar from '@/components/Dashboard/DashboardRightSidebar';

export default function DashboardPage() {
  const { user, isLoading, activeRole, switchRole, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/dashboard/job-seeker`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && !isLoading && activeRole === 1) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user, isLoading, activeRole]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (activeRole === 1 && loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const colors = ['#2563EB', '#f97316', '#10b981', '#7b3eff'];

  return (
    <>
      {/* 1. Job Seeker Dashboard View (Role 1) */}
      {activeRole === 1 && (
        <div className="dash-layout-grid">
          {/* Center Column */}
          <div className="dash-center-column">
            {/* 1. Hero Profile Banner */}
            <DashboardProfileHero
              role={1}
              user={user}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* 2. Key Performance Indicators (4 Stat Cards) */}
            <DashboardStatMetrics
              role={1}
              customMetrics={[
                {
                  id: 'js-views',
                  title: 'Profile Views',
                  val: data?.stats?.profileCompletion || '245',
                  growth: '↑ 28%',
                  period: 'This month',
                  icon: 'bi-eye-fill',
                  iconClass: 'icon-box-blue',
                },
                {
                  id: 'js-connections',
                  title: 'Profile Connections',
                  val: '132',
                  growth: '↑ 18%',
                  period: 'This month',
                  icon: 'bi-people-fill',
                  iconClass: 'icon-box-purple',
                },
                {
                  id: 'js-matches',
                  title: 'Job Matches',
                  val: data?.stats?.totalApplications || '56',
                  growth: '↑ 24%',
                  period: 'This month',
                  icon: 'bi-briefcase-fill',
                  iconClass: 'icon-box-pink',
                },
                {
                  id: 'js-messages',
                  title: 'Messages',
                  val: data?.stats?.interview || '12',
                  growth: '↑ 33%',
                  period: 'This month',
                  icon: 'bi-chat-dots-fill',
                  iconClass: 'icon-box-violet',
                },
              ]}
            />

            {/* 3. Middle 2-Column Section (About / Skills / Experience + Profile Strength) */}
            <div className="dash-middle-section-grid">
              <DashboardAboutSection role={1} user={user} />
              <DashboardProfileStrength role={1} />
            </div>

            {/* 4. Recommended Jobs (Existing Functional Component) */}
            <div className="dash-recommended-section">
              <h3>
                <span>Recommended Jobs</span>
                <Link href="/jobs" className="dash-card-link-cyan">
                  View All →
                </Link>
              </h3>

              <div className="dash-recommended-grid">
                {data?.recommendedJobs?.map((job: any, index: number) => (
                  <RecommendedJobCard
                    key={job.id}
                    job={job}
                    iconColor={colors[index % colors.length]}
                  />
                ))}
                {(!data?.recommendedJobs || data.recommendedJobs.length === 0) && (
                  <p className="text-secondary" style={{ fontSize: '12.5px' }}>
                    No recommended jobs available at this time. Explore all open roles on the job board.
                  </p>
                )}
              </div>
            </div>

            {/* 5. AdBanner */}
            <AdBanner />
          </div>

          {/* Right Sidebar */}
          <DashboardRightSidebar role={1} />
        </div>
      )}

      {/* 2. Employer Dashboard View (Role 2) */}
      {activeRole === 2 && <EmployerDashboard />}

      {/* 3. Business Promoter Dashboard View (Role 3) */}
      {activeRole === 3 && <BusinessPromoterDashboard />}
    </>
  );
}
