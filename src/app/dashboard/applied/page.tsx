"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const statusBadgeClassMap: Record<string, string> = {
  pending: 'bg-secondary',
  reviewed: 'bg-info text-dark',
  interview: 'bg-warning text-dark',
  rejected: 'bg-danger',
  accepted: 'bg-success',
};

export default function AppliedPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view applied jobs');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/jobs/applied', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      } else {
        setError(json.message || 'Failed to fetch applications');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
      <h2 className="mb-4">Applied Jobs (Applications Tracker)</h2>
      
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading applications...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : applications.length === 0 ? (
        <div className="dash-user-card text-center p-5">
          <i className="bi bi-file-earmark-text-fill mb-3 text-secondary" style={{ fontSize: '3rem' }}></i>
          <h4>No Applications Yet</h4>
          <p className="text-secondary">Jobs you apply to will show up here so you can track your status.</p>
          <Link href="/jobs" className="btn btn-primary mt-3" style={{ borderRadius: '8px' }}>
            Browse and Apply
          </Link>
        </div>
      ) : (
        <div className="dash-user-card p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Job Details</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: '1.05rem' }}>{app.title}</strong>
                        <div className="text-secondary" style={{ fontSize: '0.85rem' }}>
                          {app.location || 'Remote'} &bull; {app.jobType || 'Full-time'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-primary" style={{ fontWeight: 500 }}>{app.companyName}</span>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${statusBadgeClassMap[app.status] || 'bg-secondary'}`} style={{ padding: '0.5em 0.8em', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/jobs/${app.slug}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: '6px' }}>
                        View Job
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
