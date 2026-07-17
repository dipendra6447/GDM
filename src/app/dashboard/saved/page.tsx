"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SavedJobsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');

  const promptUnsave = (jobId: string, jobTitle: string) => {
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setShowConfirmModal(true);
  };

  const handleConfirmUnsave = async () => {
    if (!selectedJobId) return;
    await handleUnsave(selectedJobId);
    setShowConfirmModal(false);
    setSelectedJobId(null);
    setSelectedJobTitle('');
  };

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
    if (!authLoading) {
      fetchSavedJobs();
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '3rem' }}>Loading user session...</div>
      </div>
    );
  }

  const isJobSeeker = user?.roles?.includes(1);

  if (!user) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">Saved Jobs (Wishlist)</h2>
        <div className="alert alert-danger">Please log in to view saved jobs.</div>
      </div>
    );
  }

  if (!isJobSeeker) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">Saved Jobs (Wishlist)</h2>
        <div className="alert alert-danger">
          Access Denied. Only Job Seekers can view saved jobs.
        </div>
      </div>
    );
  }

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
              className="dash-user-card p-4 d-flex flex-row justify-content-between align-items-center flex-wrap" 
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
                  onClick={() => promptUnsave(job.id, job.title)} 
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

      {/* CUSTOM CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div 
          className="modal-backdrop-blur"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
            className="card"
            style={{
              width: '400px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              background: '#ffffff',
              padding: '24px',
            }}
          >
            <div className="text-center mb-3">
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem'
                }}
              >
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <h4 style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>Remove Saved Job?</h4>
            </div>
            
            <p className="text-center text-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to remove <strong>{selectedJobTitle}</strong> from your saved list? You will need to find and bookmark it again to apply later.
            </p>
            
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-outline-secondary" 
                style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 500, flex: 1 }}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedJobId(null);
                  setSelectedJobTitle('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 500, flex: 1, backgroundColor: '#ef4444', border: 'none' }}
                onClick={handleConfirmUnsave}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
