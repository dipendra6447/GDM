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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export default function EmployerDashboard() {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'post' | 'edit'>('overview');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Applicant Tracking State
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

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

  const handleTrack = async (job: any) => {
    setSelectedJob(job);
    setShowTrackModal(true);
    setLoadingApplicants(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${job.id}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplicants(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching applicants", error);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && user?.roles?.includes(2)) {
      fetchJobs();
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
    setActiveTab('edit');
  };

  if (isLoading || (!isLoggedIn && !user)) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;

  const activeJobsCount = jobs.filter(j => j.isActive).length;
  const totalJobsCount = jobs.length;
  const totalApplicants = 0; // Mocked for now

  return (
    <div className="emp-dash-layout">
      {/* Sidebar Navigation */}
      <aside className="emp-dash-sidebar">
        <div className="emp-dash-nav">
          <button 
            className={`emp-dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-grid" /> Overview
          </button>
          <button 
            className={`emp-dash-nav-item ${(activeTab === 'jobs' || activeTab === 'edit') ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="bi bi-briefcase" /> My Jobs
          </button>
          <button 
            className={`emp-dash-nav-item ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => setActiveTab('post')}
          >
            <i className="bi bi-plus-circle" /> Post New Job
          </button>
          {/* Settings links back to standard profile for now */}
          <Link href="/profile" className="emp-dash-nav-item">
            <i className="bi bi-gear" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="emp-dash-main">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="emp-dash-header">
              <div>
                <h1 className="emp-dash-title">Dashboard Overview</h1>
                <p className="emp-dash-subtitle">Track your recruitment performance</p>
              </div>
              <button className="emp-primary-btn" onClick={() => setActiveTab('post')}>
                <i className="bi bi-plus" /> Post Job
              </button>
            </div>

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

            <div className="emp-dash-chart-card">
              <div className="emp-dash-chart-header">Application Trends</div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={mockChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Legend />
                    <Bar dataKey="applicants" fill="#2563eb" radius={[4, 4, 0, 0]} name="Applicants" />
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
              <button className="emp-primary-btn" onClick={() => setActiveTab('post')}>
                <i className="bi bi-plus" /> Post Job
              </button>
            </div>

            <div className="emp-dash-table-card">
              {loadingJobs ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="emp-empty-state">
                  <i className="bi bi-inbox" />
                  <h4>No Jobs Found</h4>
                  <p>You haven't posted any jobs yet.</p>
                  <button className="emp-primary-btn" onClick={() => setActiveTab('post')}>Post your first job</button>
                </div>
              ) : (
                <div className="emp-table-wrapper">
                  <table className="emp-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
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
                              <h4>{job.title}</h4>
                              <span>{job.location || 'Location Not Specified'}</span>
                            </div>
                          </td>
                          <td>{new Date(job.createdAt).toLocaleDateString()}</td>
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
                              <span style={{ fontSize: '0.85rem', color: job.isActive ? '#10b981' : '#64748b', fontWeight: 500 }}>
                                {job.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td>
                            0 <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>(Mock)</span>
                          </td>
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {/* Track Button */}
                            <button className="emp-action-btn" title="View Applicants" onClick={() => handleTrack(job)}>
                              <i className="bi bi-people" />
                            </button>
                            
                            {/* Edit Button */}
                            <button className="emp-action-btn" title="Edit Job" onClick={() => handleEdit(job.id)}>
                              <i className="bi bi-pencil" />
                            </button>

                            {/* Delete Button */}
                            <button className="emp-action-btn delete" title="Delete Job" onClick={() => handleDelete(job.id)}>
                              <i className="bi bi-trash" />
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
              <button className="emp-action-btn" onClick={() => setActiveTab('jobs')}>
                <i className="bi bi-arrow-left" /> Back to Jobs
              </button>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <PostJob 
                overrideTab="post" 
                editJobId={editingJobId} 
                onJobPosted={() => {
                  fetchJobs();
                  setActiveTab('jobs');
                }} 
              />
            </div>
          </div>
        )}
      </main>

      {/* TRACK APPLICANTS MODAL */}
      {showTrackModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal">
            <div className="emp-modal-header">
              <h2>Applicants for {selectedJob?.title}</h2>
              <button className="emp-modal-close" onClick={() => setShowTrackModal(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="emp-modal-content">
              {loadingApplicants ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading applicants...</div>
              ) : applicants.length === 0 ? (
                <div className="emp-empty-state">
                  <i className="bi bi-people" />
                  <h4>No Applicants Yet</h4>
                  <p>Check back later to see who has applied.</p>
                </div>
              ) : (
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <strong>{app.firstName} {app.lastName}</strong>
                        </td>
                        <td>{app.email}</td>
                        <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td>
                          <span className="emp-status-badge active">{app.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
