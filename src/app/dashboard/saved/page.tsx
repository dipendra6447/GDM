"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view saved jobs');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/jobs/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSavedJobs(json.data);
      } else {
        setError(json.message || 'Failed to fetch saved jobs');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`/api/jobs/saved/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        alert(json.message || 'Failed to unsave job');
      }
    } catch (err) {
      console.error("Error unsaving job:", err);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  return (
    <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
      <h2 className="mb-4">Saved Jobs (Wishlist)</h2>
      
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>Loading saved jobs...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : savedJobs.length === 0 ? (
        <div className="dash-user-card text-center p-5">
          <i className="bi bi-bookmark-fill mb-3 text-secondary" style={{ fontSize: '3rem' }}></i>
          <h4>No Saved Jobs Yet</h4>
          <p className="text-secondary">Jobs you bookmark will appear here so you can apply to them later.</p>
          <Link href="/jobs" className="btn btn-primary mt-3" style={{ borderRadius: '8px' }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {savedJobs.map((job) => (
            <div 
              key={job.id} 
              className="dash-user-card p-4 d-flex justify-content-between align-items-center flex-wrap" 
              style={{ gap: '1rem', opacity: job.isActive ? 1 : 0.75 }}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                  <h4 style={{ margin: 0, fontWeight: 600 }}>{job.title}</h4>
                  {!job.isActive && (
                    <span className="badge bg-danger" style={{ fontSize: '0.75rem', padding: '0.3em 0.6em' }}>Closed / Expired</span>
                  )}
                </div>
                <p className="text-primary mb-2" style={{ fontWeight: 500 }}>{job.companyName}</p>
                <div className="d-flex align-items-center gap-3 text-secondary" style={{ fontSize: '0.875rem' }}>
                  <span><i className="bi bi-geo-alt me-1"></i>{job.location || 'Remote'}</span>
                  <span><i className="bi bi-briefcase me-1"></i>{job.jobType || 'Full-time'}</span>
                  <span><i className="bi bi-currency-dollar me-1"></i>{job.salaryRange || 'Competitive'}</span>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <Link href={`/jobs/${job.slug}`} className="btn btn-primary" style={{ borderRadius: '8px' }}>
                  View Details
                </Link>
                <button 
                  onClick={() => handleUnsave(job.id)} 
                  className="btn btn-outline-danger" 
                  style={{ borderRadius: '8px' }}
                  title="Remove from Saved"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
