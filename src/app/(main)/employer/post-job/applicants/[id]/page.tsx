"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import '@/views/EmployerDashboard/EmployerDashboard.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params?.id as string;
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login?role=job_poster');
      return;
    }
    if (!isLoading && isLoggedIn && user && !user.roles.includes(2)) {
      router.push('/');
      return;
    }
  }, [isLoading, isLoggedIn, user, router]);

  useEffect(() => {
    if (!jobId || !isLoggedIn || !user?.roles?.includes(2)) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Fetch Job Details
        const jobRes = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const jobJson = await jobRes.json();
        if (jobRes.ok && jobJson.success) {
          setJob(jobJson.data);
        }

        // Fetch Applicants
        const applicantsRes = await fetch(`${API_BASE}/api/jobs/${jobId}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const applicantsJson = await applicantsRes.json();
        if (applicantsRes.ok && applicantsJson.success) {
          setApplicants(applicantsJson.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, isLoggedIn, user]);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/applicants`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
      } else {
        alert(data.message || 'Failed to update applicant status');
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="emp-dash-layout d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="emp-dash-layout">
      {/* Sidebar Navigation */}
      <aside className="emp-dash-sidebar">
        <div className="emp-dash-nav">
          <Link href="/employer/post-job" className="emp-dash-nav-item">
            <i className="bi bi-grid" /> Overview
          </Link>
          <Link href="/employer/post-job" className="emp-dash-nav-item active">
            <i className="bi bi-briefcase" /> My Jobs
          </Link>
          <Link href="/employer/post-job" className="emp-dash-nav-item">
            <i className="bi bi-plus-circle" /> Post New Job
          </Link>
          <Link href="/profile" className="emp-dash-nav-item">
            <i className="bi bi-gear" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="emp-dash-main">
        <Breadcrumb items={[{ label: 'Employer', href: '/employer/post-job' }, { label: 'Applicants' }]} className="mb-3" />
        <div className="emp-dash-header">
          <div>
            <h1 className="emp-dash-title">Applicants</h1>
            <p className="emp-dash-subtitle">
              {job ? `Viewing applicants for "${job.title}"` : 'Job Applicants Tracker'}
            </p>
          </div>
          <Link href="/employer/post-job" className="emp-primary-btn">
            <i className="bi bi-arrow-left" /> Back to Dashboard
          </Link>
        </div>

        <div className="emp-dash-table-card">
          <div className="emp-dash-table-header-row">
            <h3>Applicant Directory ({applicants.length})</h3>
          </div>

          <div className="emp-table-wrapper">
            {applicants.length === 0 ? (
              <div className="emp-empty-state" style={{ padding: '4rem 2rem' }}>
                <i className="bi bi-people" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem', display: 'block' }} />
                <h4>No Applicants Yet</h4>
                <p className="text-secondary">Check back later to see who has applied.</p>
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
                        <select
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="form-select form-select-sm"
                          style={{ 
                            width: 'auto', 
                            display: 'inline-block', 
                            borderRadius: '6px', 
                            backgroundColor: '#f8fafc', 
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            padding: '4px 12px'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="accepted">Accepted</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
