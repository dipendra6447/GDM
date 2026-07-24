"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import './EmployerDashboard.css';
import PostJob from '../Employer/PostJob'; // We will still use this for the Post Job view
import StatCard from '@/components/Dashboard/StatCard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Mock Data for Charts
const mockChartData = [
  { name: 'Jan', applicants: 40, views: 240 },
  { name: 'Feb', applicants: 30, views: 139 },
  { name: 'Mar', applicants: 20, views: 980 },
  { name: 'Apr', applicants: 27, views: 390 },
  { name: 'May', applicants: 18, views: 480 },
  { name: 'Jun', applicants: 23, views: 380 },
  { name: 'Jul', applicants: 34, views: 430 },
];

import { useSearchParams, usePathname } from 'next/navigation';

import EmployerCandidateSearch from '@/components/EmployerHome/EmployerCandidateSearch';

export default function EmployerDashboard() {
  const { user, isLoading, isLoggedIn, activeRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMainDashboard = false;

  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'post' | 'edit' | 'subscription' | 'candidates'>('overview');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && isLoggedIn && activeRole !== 2) {
      if (activeRole === 1) {
        router.replace('/seeker');
      } else if (activeRole === 3) {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, isLoggedIn, activeRole, router]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'overview' || tab === 'jobs' || tab === 'post' || tab === 'edit' || tab === 'subscription' || tab === 'candidates') {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'overview' | 'jobs' | 'post' | 'edit' | 'subscription' | 'candidates') => {
    setActiveTab(tab);
    router.push(`/employer/post-job?tab=${tab}`, { scroll: false });
  };



  // Fetch Jobs
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/employer/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoadingJobs(false);
    }
  };



  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/subscriptions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching subscriptions", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.roles?.includes(2)) {
      fetchJobs();
      fetchSubscriptions();
    }
  }, [isLoggedIn, user]);

  // Auth Guards
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login?role=job_poster');
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoading && isLoggedIn && user && !user.roles.includes(2)) {
      router.push('/');
    }
  }, [isLoading, isLoggedIn, user, router]);

  const handleToggleStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setJobs(prev => prev.map(job => job.id === jobId ? { ...job, isActive: !currentStatus } : job));
      }
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (error) {
      console.error("Error deleting job", error);
    }
  };

  const handleEdit = (jobId: string) => {
    setEditingJobId(jobId);
    handleTabChange('edit');
  };

  if (isLoading || (!isLoggedIn && !user)) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;

  const activeJobsCount = jobs.filter(j => j.isActive).length;
  const totalJobsCount = jobs.length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);

  return (
    <div className={isMainDashboard ? "" : "emp-dash-layout"}>
      {/* Sidebar Navigation (only show if not on main dashboard) */}
      {!isMainDashboard && (
        <aside className="emp-dash-sidebar">
          <div className="emp-dash-nav">
            <button 
              className={`emp-dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <i className="bi bi-grid" /> Overview
            </button>
            <button 
              className={`emp-dash-nav-item ${(activeTab === 'jobs' || activeTab === 'edit') ? 'active' : ''}`}
              onClick={() => handleTabChange('jobs')}
            >
              <i className="bi bi-briefcase" /> My Jobs
            </button>
            <button 
              className={`emp-dash-nav-item ${activeTab === 'post' ? 'active' : ''}`}
              onClick={() => handleTabChange('post')}
            >
              <i className="bi bi-plus-circle" /> Post New Job
            </button>
            <button 
              className={`emp-dash-nav-item ${activeTab === 'subscription' ? 'active' : ''}`}
              onClick={() => handleTabChange('subscription')}
            >
              <i className="bi bi-credit-card" /> My Subscription
            </button>
            {/* Settings links back to standard profile for now */}
            <Link href="/profile" className="emp-dash-nav-item">
              <i className="bi bi-gear" /> Settings
            </Link>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={isMainDashboard ? "" : "emp-dash-main"}>
        {isMainDashboard && (
          <div className="d-flex gap-2 mb-4 flex-wrap pb-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            {(['overview', 'jobs', 'post', 'candidates', 'subscription'] as const).map(tab => {
              const isActive = activeTab === tab || (tab === 'jobs' && activeTab === 'edit');
              const label = 
                tab === 'overview' ? 'Overview' :
                tab === 'jobs' ? 'My Jobs' :
                tab === 'post' ? 'Post New Job' :
                tab === 'candidates' ? 'Search Candidates' : 'My Subscription';
              const icon =
                tab === 'overview' ? 'bi-grid' :
                tab === 'jobs' ? 'bi-briefcase' :
                tab === 'post' ? 'bi-plus-circle' :
                tab === 'candidates' ? 'bi-people' : 'bi-credit-card';

              return (
                <button
                  key={tab}
                  className="btn btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                  onClick={() => handleTabChange(tab)}
                  style={{
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    background: isActive ? 'rgba(36, 84, 255, 0.1)' : 'transparent',
                    color: isActive ? '#2454ff' : '#64748b',
                    border: isActive ? '1px solid rgba(36, 84, 255, 0.2)' : '1px solid transparent',
                  }}
                >
                  <i className={`bi ${icon}`} />
                  {label}
                </button>
              );
            })}
          </div>
        )}
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="emp-dash-header">
              <div>
                <h1 className="emp-dash-title">Dashboard Overview</h1>
                <p className="emp-dash-subtitle">Track your recruitment performance</p>
              </div>
              <button 
                className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2" 
                style={{ borderRadius: '12px', background: '#2454ff', border: 'none' }}
                onClick={() => handleTabChange('post')}
              >
                <i className="bi bi-plus" /> Post Job
              </button>
            </div>

            {isMainDashboard ? (
              <div className="dash-stats-grid mb-4">
                <StatCard 
                  title="Total Jobs" 
                  value={totalJobsCount} 
                  icon="bi-briefcase" 
                  colorScheme="blue" 
                />
                <StatCard 
                  title="Active Jobs" 
                  value={activeJobsCount} 
                  icon="bi-check-circle" 
                  colorScheme="green" 
                />
                <StatCard 
                  title="Total Applicants" 
                  value={totalApplicants} 
                  icon="bi-people" 
                  colorScheme="orange" 
                />
                <StatCard 
                  title="Active Subscription" 
                  value={subscriptions.length > 0 ? (subscriptions.find(s => s.status === 'active')?.tier?.toUpperCase() || 'FREE') : 'FREE'} 
                  icon="bi-credit-card" 
                  colorScheme="purple" 
                />
              </div>
            ) : (
              <div className="emp-dash-stats-grid">
                <div className="emp-dash-stat-card">
                  <div className="emp-dash-stat-icon primary"><i className="bi bi-briefcase" /></div>
                  <div className="emp-dash-stat-info">
                    <h3>Total Jobs</h3>
                    <p>{totalJobsCount}</p>
                  </div>
                </div>
                <div className="emp-dash-stat-card">
                  <div className="emp-dash-stat-icon success"><i className="bi bi-check-circle" /></div>
                  <div className="emp-dash-stat-info">
                    <h3>Active Jobs</h3>
                    <p>{activeJobsCount}</p>
                  </div>
                </div>
                <div className="emp-dash-stat-card">
                  <div className="emp-dash-stat-icon warning"><i className="bi bi-people" /></div>
                  <div className="emp-dash-stat-info">
                    <h3>Total Applicants</h3>
                    <p>{totalApplicants}</p>
                  </div>
                </div>
              </div>
            )}

            <div className={isMainDashboard ? "card border-0 shadow-sm p-4 mb-4" : "emp-dash-chart-card"}>
              <div className={isMainDashboard ? "fw-bold mb-3 fs-5 text-dark" : "emp-dash-chart-header"}>Application Trends</div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={mockChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Legend />
                    <Bar dataKey="applicants" fill="#2454ff" radius={[4, 4, 0, 0]} name="Applicants" />
                    <Bar dataKey="views" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* JOBS TABLE TAB */}
        {activeTab === 'jobs' && (
          <div>
            <div className="emp-dash-header">
              <div>
                <h1 className="emp-dash-title">Manage Jobs</h1>
                <p className="emp-dash-subtitle">View, edit, and track applicants for your job listings.</p>
              </div>
              <button 
                className="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2" 
                style={{ borderRadius: '12px', background: '#2454ff', border: 'none' }}
                onClick={() => handleTabChange('post')}
              >
                <i className="bi bi-plus" /> Post Job
              </button>
            </div>

            <div className={isMainDashboard ? "card border-0 shadow-sm p-4" : "emp-dash-table-card"}>
              {loadingJobs ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="emp-empty-state text-center p-5">
                  <i className="bi bi-inbox fs-1 text-secondary mb-3" />
                  <h4>No Jobs Found</h4>
                  <p className="text-secondary mb-4">You haven't posted any jobs yet.</p>
                  <button 
                    className="btn btn-primary px-4 py-2" 
                    style={{ borderRadius: '10px' }}
                    onClick={() => handleTabChange('post')}
                  >
                    Post your first job
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className={isMainDashboard ? "table align-middle table-hover mb-0" : "emp-table"}>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Category</th>
                        <th>Posted Date</th>
                        <th>Status</th>
                        <th>Applicants</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id}>
                          <td>
                            <div className="emp-job-title-col">
                              <h4 className="fw-bold mb-1" style={{ fontSize: '1rem', color: '#1e293b' }}>{job.title}</h4>
                              <span className="text-secondary" style={{ fontSize: '0.82rem' }}>{job.location || 'Location Not Specified'}</span>
                            </div>
                          </td>
                          <td>
                            <span 
                              className="badge bg-light text-secondary px-3 py-2 fw-semibold" 
                              style={{ borderRadius: '8px', fontSize: '0.78rem' }}
                            >
                              {job.category || 'Not specified'}
                            </span>
                          </td>
                          <td className="text-secondary" style={{ fontSize: '0.88rem' }}>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <label className="emp-toggle">
                                <input 
                                  type="checkbox" 
                                  checked={job.isActive} 
                                  onChange={() => handleToggleStatus(job.id, job.isActive)} 
                                />
                                <span className="emp-slider"></span>
                              </label>
                              <span style={{ fontSize: '0.85rem', color: job.isActive ? '#10b981' : '#64748b', fontWeight: 600 }}>
                                {job.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary px-3 py-2 fw-bold" style={{ borderRadius: '8px', fontSize: '0.78rem' }}>
                              {job.applicantCount || 0} Applied
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {/* Track Button */}
                            <button 
                              className="btn btn-sm btn-link text-primary me-2" 
                              title="View Applicants" 
                              onClick={() => router.push(`/employer/post-job/applicants/${job.id}`)}
                            >
                              <i className="bi bi-people fs-5" />
                            </button>
                            
                            {/* Edit Button */}
                            <button 
                              className="btn btn-sm btn-link text-secondary me-2" 
                              title="Edit Job" 
                              onClick={() => handleEdit(job.id)}
                            >
                              <i className="bi bi-pencil-square fs-5" />
                            </button>

                            {/* Delete Button */}
                            <button 
                              className="btn btn-sm btn-link text-danger" 
                              title="Delete Job" 
                              onClick={() => handleDelete(job.id)}
                            >
                              <i className="bi bi-trash fs-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* POST JOB TAB (Uses existing PostJob but isolated) */}
        {activeTab === 'post' && (
          <div>
            <div className="emp-dash-header">
              <div>
                <h1 className="emp-dash-title">Post a New Job</h1>
                <p className="emp-dash-subtitle">Fill in the details to publish a new job listing.</p>
              </div>
              <button className="emp-action-btn" onClick={() => setActiveTab('jobs')}>
                <i className="bi bi-arrow-left" /> Back to Jobs
              </button>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <PostJob overrideTab="post" onJobPosted={() => {
                fetchJobs();
                setActiveTab('jobs');
              }} />
            </div>
          </div>
        )}

        {/* EDIT JOB TAB */}
        {activeTab === 'edit' && editingJobId && (
          <div>
            <div className="emp-dash-header">
              <div>
                <h1 className="emp-dash-title">Edit Job</h1>
                <p className="emp-dash-subtitle">Update the details of your job listing.</p>
              </div>
              <button className="emp-action-btn" onClick={() => handleTabChange('jobs')}>
                <i className="bi bi-arrow-left" /> Back to Jobs
              </button>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <PostJob 
                overrideTab="post" 
                editJobId={editingJobId} 
                onJobPosted={() => {
                  fetchJobs();
                  handleTabChange('jobs');
                }} 
              />
            </div>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {activeTab === 'candidates' && (
          <div>
            <div className="emp-dash-header">
              <div>
                <h1 className="emp-dash-title">Search Candidates</h1>
                <p className="emp-dash-subtitle">Find and connect with pre-screened, verified job seekers.</p>
              </div>
            </div>
            <EmployerCandidateSearch />
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === 'subscription' && (() => {
          const activeSub = subscriptions.find(
            (sub) => sub.subscriptionType === 'job_poster' && sub.status === 'active' && new Date(sub.expiresAt) > new Date()
          );
          const postedCount = jobs.length;
          const freeLimit = 3;

          return (
            <div>
              <div className="emp-dash-header">
                <div>
                  <h1 className="emp-dash-title">My Subscription</h1>
                  <p className="emp-dash-subtitle">Manage and track your employer recruiting plan</p>
                </div>
              </div>

              <div className="row g-4 mt-2">
                <div className="col-lg-6">
                  {activeSub ? (
                    /* PREMIUM PLAN CARD */
                    <div 
                      className="card text-white p-4" 
                      style={{ 
                        borderRadius: '16px', 
                        background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', 
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <span 
                            className="badge mb-2" 
                            style={{ 
                              backgroundColor: '#D4AF37', 
                              color: '#0A0A0A', 
                              fontWeight: 600,
                              boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)' 
                            }}
                          >
                            ✨ PROFESSIONAL MEMBER
                          </span>
                          <h3 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Employer Professional</h3>
                          <p className="text-secondary text-capitalize mb-0" style={{ fontSize: '0.9rem' }}>Tier: {activeSub.tier} Plan</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>Billing Price</p>
                          <h4 style={{ fontWeight: 700, margin: 0 }}>
                            {activeSub.tier === 'daily' ? '₹49/day' : activeSub.tier === 'weekly' ? '₹199/week' : '₹599/month'}
                          </h4>
                        </div>
                      </div>

                      <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />

                      <div className="mb-4 text-secondary" style={{ fontSize: '0.95rem' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-check-circle-fill text-success"></i>
                          <span>Status: <strong className="text-white">Active</strong></span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-calendar-event text-warning"></i>
                          <span>Purchased: {new Date(activeSub.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-clock-history text-danger"></i>
                          <span>Expires: <strong className="text-white">{new Date(activeSub.expiresAt).toLocaleDateString()}</strong></span>
                        </div>
                      </div>

                      <Link href="/subscription" className="btn btn-outline-warning w-100" style={{ borderRadius: '8px', border: '1px solid #D4AF37', color: '#D4AF37' }}>
                        Manage Subscription
                      </Link>
                    </div>
                  ) : (
                    /* FREE PLAN CARD */
                    <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
                      <div className="mb-3">
                        <span className="badge bg-secondary mb-2" style={{ fontWeight: 500 }}>CURRENT PLAN</span>
                        <h3 className="mb-1" style={{ fontWeight: 700 }}>Free Employer Plan</h3>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Pricing: ₹0 (Free Tier)</p>
                      </div>

                      <hr />

                      <div className="mb-4">
                        <h5 className="mb-2" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Free Job Postings Remaining</h5>
                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                          <span className="text-secondary">Used: {postedCount} of {freeLimit} postings</span>
                          <span className="font-weight-bold">{postedCount >= freeLimit ? 'Limit reached' : `${freeLimit - postedCount} left`}</span>
                        </div>
                        <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                          <div 
                            className={`progress-bar ${postedCount >= freeLimit ? 'bg-danger' : 'bg-primary'}`} 
                            role="progressbar" 
                            style={{ width: `${Math.min((postedCount / freeLimit) * 100, 100)}%` }}
                            aria-valuenow={postedCount} 
                            aria-valuemin={0} 
                            aria-valuemax={freeLimit}
                          ></div>
                        </div>
                        {postedCount >= freeLimit && (
                          <div className="alert alert-warning mt-3 mb-0 py-2" style={{ fontSize: '0.85rem' }}>
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            You have run out of free job postings. Upgrade to write more listings!
                          </div>
                        )}
                      </div>

                      <Link href="/subscription" className="btn btn-primary w-100" style={{ borderRadius: '8px', padding: '12px', fontWeight: 600 }}>
                        Upgrade to Professional
                      </Link>
                    </div>
                  )}
                </div>

                <div className="col-lg-6">
                  <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
                    <h4 className="mb-3" style={{ fontWeight: 600 }}>Professional Plan Benefits</h4>
                    <ul className="list-unstyled mb-0" style={{ display: 'grid', gap: '0.75rem' }}>
                      <li className="d-flex align-items-start gap-2">
                        <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                        <div>
                          <strong>Unlimited Job Posting</strong>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Post and manage as many active listings as your business needs.</p>
                        </div>
                      </li>
                      <li className="d-flex align-items-start gap-2">
                        <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                        <div>
                          <strong>Featured Jobs Badge</strong>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Mark listings as featured to gain up to 10x higher response rates.</p>
                        </div>
                      </li>
                      <li className="d-flex align-items-start gap-2">
                        <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                        <div>
                          <strong>Advanced Recruitment Dashboard</strong>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Shortlist, label, track candidates, and access analytics details.</p>
                        </div>
                      </li>
                      <li className="d-flex align-items-start gap-2">
                        <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                        <div>
                          <strong>Company Verification Badge</strong>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Build company trust with candidates via a verified recruiter mark.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

    </div>
  );
}
