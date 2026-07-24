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

// Dummy chart data mimicking the design
const chartData = [
  { month: 'Jul', applied: 150, interviews: 20, rejected: 100 },
  { month: 'Aug', applied: 220, interviews: 40, rejected: 150 },
  { month: 'Sep', applied: 300, interviews: 60, rejected: 240 },
  { month: 'Oct', applied: 180, interviews: 50, rejected: 100 },
  { month: 'Nov', applied: 260, interviews: 70, rejected: 160 },
  { month: 'Dec', applied: 290, interviews: 90, rejected: 180 },
];

export default function DashboardPage() {
  const { user, isLoading, activeRole, switchRole, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user && !isLoading && activeRole === 2) {
      router.replace('/employer/post-job?tab=overview');
      return;
    }

    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
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
  }, [user, isLoading, activeRole, router]);

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

  const getInitial = () => user?.email?.charAt(0).toUpperCase() || 'U';
  
  const colors = ['#2454FF', '#f97316', '#10b981', '#7b3eff'];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Dashboard' }]} className="mb-3" />



      {/* Conditional Dashboard Views */}
      {activeRole === 1 && (
        <>
          <div className="dash-top-grid">
            <div className="dash-stats-grid">
              <StatCard 
                title="Application Sent" 
                value={data?.stats?.totalApplications || 0} 
                icon="bi-file-earmark-check" 
                colorScheme="blue" 
              />
              <StatCard 
                title="Interview Call" 
                value={data?.stats?.interview || 0} 
                icon="bi-camera-video" 
                colorScheme="orange" 
              />
              <StatCard 
                title="Profile View" 
                value={data?.stats?.profileCompletion || 0} 
                icon="bi-person" 
                colorScheme="green" 
              />
              <StatCard 
                title="Application Reject" 
                value={data?.stats?.rejected || 0} 
                icon="bi-file-earmark-x" 
                colorScheme="purple" 
              />
            </div>

            <div className="dash-user-card">
              <div className="dash-user-header">
                <div className="dash-user-info">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="avatar" />
                  ) : (
                    <div className="dash-avatar me-2" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>{getInitial()}</div>
                  )}
                  <div>
                    <h4>{data?.profile?.firstName ? `${data.profile.firstName} ${data.profile.lastName}` : user?.email?.split('@')[0]}</h4>
                    <p>{data?.profile?.currentJobTitle || 'Job Seeker'}</p>
                  </div>
                </div>
                <button className="btn-ai">AI Suggestion</button>
              </div>

              <div className="dash-skills-circles">
                <div className="skill-circle">
                  <div className="circle-chart" style={{ '--pct': '60%', '--color': '#2454FF' } as any}>
                    <span>60%</span>
                  </div>
                  <p>Research</p>
                </div>
                <div className="skill-circle">
                  <div className="circle-chart" style={{ '--pct': '70%', '--color': '#f97316' } as any}>
                    <span>70%</span>
                  </div>
                  <p>UX</p>
                </div>
                <div className="skill-circle">
                  <div className="circle-chart" style={{ '--pct': '90%', '--color': '#10b981' } as any}>
                    <span>90%</span>
                  </div>
                  <p>UI</p>
                </div>
                <div className="skill-circle">
                  <div className="circle-chart" style={{ '--pct': '85%', '--color': '#7b3eff' } as any}>
                    <span>85%</span>
                  </div>
                  <p>Figma</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-charts-grid">
            <div className="chart-card">
              <div className="chart-card-header">
                <h3>Application Status</h3>
                <select className="chart-date-filter border-0">
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <ApplicationChart data={chartData} />
            </div>
            <div className="chart-card">
              <div className="chart-card-header">
                <h3>Learning Progress</h3>
                <select className="chart-date-filter border-0">
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex align-items-end justify-content-between h-100 pb-4" style={{ gap: '10px' }}>
                {[40, 70, 60, 50, 45, 30].map((val, i) => (
                  <div key={i} className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                    <div style={{ width: '100%', height: `${val}%`, minHeight: '10px', background: 'linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.3) 100%)', borderRadius: '4px 4px 0 0' }}></div>
                    <span className="mt-2" style={{ fontSize: '0.7rem', color: '#64748b' }}>{['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dash-recommended-section">
            <h3>
              Recommend Job
              <button className="btn btn-sm btn-primary" style={{ borderRadius: '8px' }}>View All</button>
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
                <p className="text-secondary">No recommended jobs available at this time.</p>
              )}
            </div>
          </div>
        </>
      )}

      {activeRole === 2 && (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-secondary">Redirecting to Employer Dashboard...</p>
        </div>
      )}

      {activeRole === 3 && <BusinessPromoterDashboard />}
    </>
  );
}
