"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

// Components
import SearchResultCard from '../../../components/SearchResultCard/SearchResultCard';
import SkeletonSearchResultCard from '../../../components/SearchResultCard/SkeletonSearchResultCard';
import SearchPagination from '../../../components/SearchPagination/SearchPagination';

// Style import to share the job listing two-column layout
import '../../../views/JobListing/JobListing.css';

const ITEMS_PER_PAGE = 10;

export default function SavedJobsPage() {
  const { user, isLoading: authLoading, isLoggedIn } = useAuth();
  const isEmployer = isLoggedIn && !user?.roles?.includes(1);

  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedJobSaved, setSelectedJobSaved] = useState(true);
  const [selectedJobApplied, setSelectedJobApplied] = useState(false);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJobToUnsave, setSelectedJobToUnsave] = useState<any>(null);

  const selectJob = async (job: any) => {
    setSelectedJob(job);
    if (!job) {
      setSelectedJobSaved(false);
      setSelectedJobApplied(false);
      return;
    }
    setSelectedJobSaved(true);
    setSelectedJobApplied(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && job) {
      try {
        const res = await fetch(`/api/jobs/${job.id}/apply`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setSelectedJobApplied(json.applied);
        }
      } catch (err) {
        console.error("Failed to check apply status:", err);
      }
    }
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
        const mapped = json.data.map((j: any) => ({
          id: j.id,
          slug: j.slug,
          type: 'job',
          title: j.title,
          company: j.companyName || 'Company Name Hidden',
          companyInitials: (j.companyName || 'C').substring(0, 2).toUpperCase(),
          companyColor: '#2454FF',
          location: j.location || 'Location Not Provided',
          workMode: j.workMode,
          employmentType: j.jobType,
          salary: j.salaryRange,
          description: j.description
            ? j.description
              .replace(/<[^>]*>?/gm, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 150) + '...'
            : '',
          rawDescription: j.description || '',
          experience: j.experience,
          education: j.education,
          benefits: j.benefits,
          category: j.category,
          skills: j.skills ? j.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          postedTime: new Date(j.createdAt).toLocaleDateString(),
          isSaved: true,
        }));
        setSavedJobs(mapped);
        
        // Auto-select first job
        if (mapped.length > 0) {
          selectJob(mapped[0]);
        } else {
          selectJob(null);
        }
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
        setSavedJobs(prev => {
          const updated = prev.filter(job => job.id !== jobId);
          // If we unsaved the selected job, select another one
          if (selectedJob?.id === jobId) {
            if (updated.length > 0) {
              selectJob(updated[0]);
            } else {
              selectJob(null);
            }
          }
          return updated;
        });
      } else {
        alert(json.message || 'Failed to unsave job');
      }
    } catch (err) {
      console.error("Error unsaving job:", err);
    }
  };

  const handleApplySelectedJob = async () => {
    if (!selectedJob) return;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    if (selectedJobApplied) return;
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setSelectedJobApplied(true);
        alert('Application submitted successfully!');
      } else if (res.status === 403) {
        alert(json.message || 'Limit reached. Please buy a plan.');
        window.location.href = '/subscription';
      } else {
        alert(json.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error("Error applying to job:", err);
    }
  };

  const promptUnsave = (job: any) => {
    setSelectedJobToUnsave(job);
    setShowConfirmModal(true);
  };

  const handleConfirmUnsave = async () => {
    if (!selectedJobToUnsave) return;
    await handleUnsave(selectedJobToUnsave.id);
    setShowConfirmModal(false);
    setSelectedJobToUnsave(null);
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

  // Local pagination math
  const totalPages = Math.ceil(savedJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = savedJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Auto-select first job on the new page
    const pageFirstJob = savedJobs[(page - 1) * ITEMS_PER_PAGE];
    if (pageFirstJob) {
      selectJob(pageFirstJob);
    }
  };

  return (
    <div className="dashboard-content-wrapper">
      <div className="jl2-layout" style={{ maxWidth: '100%', margin: 0, padding: 0 }}>
        {/* ── Left Column: Saved Jobs List ── */}
        <div className="jl2-center">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ margin: 0, fontWeight: 700 }}>Saved Jobs (Wishlist)</h2>
            <span className="badge bg-primary px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.85rem' }}>
              {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
            </span>
          </div>

          <div className="jl2-results-list" role="list" aria-label="Saved jobs list">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <SkeletonSearchResultCard key={`skeleton-saved-${index}`} />
              ))
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
              paginatedJobs.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  isSelected={selectedJob?.id === result.id}
                  onSelect={() => selectJob(result)}
                  onSaveToggle={(newSavedState) => {
                    if (!newSavedState) {
                      // Trigger confirmation prompt to unsave
                      promptUnsave(result);
                    }
                  }}
                />
              ))
            )}
          </div>

          {savedJobs.length > ITEMS_PER_PAGE && (
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* ── Right Column: Selected Job Details ── */}
        <aside className="jl2-right-sidebar" aria-label="Job details" style={{ position: 'sticky', top: '10px' }}>
          <div className="jl2-right-sticky">
            {!selectedJob ? (
              <div className="jl2-details-placeholder">
                <i className="bi bi-briefcase" style={{ fontSize: '3rem', color: 'var(--color-text-gray)', marginBottom: '1rem' }} />
                <p>Select a job to view details</p>
              </div>
            ) : (
              <div className="jl2-details-card">
                {/* Details Header */}
                <div className="jl2-details-header">
                  <div className="jl2-details-header-main">
                    <div className="jl2-details-title-row">
                      <h2 className="jl2-details-title">{selectedJob.title}</h2>
                      <div className="jl2-details-actions">
                        <button
                          className="jl2-action-btn jl2-saved"
                          onClick={() => promptUnsave(selectedJob)}
                          title="Unsave job"
                          aria-label="Unsave job"
                        >
                          <i className="bi bi-bookmark-fill" />
                        </button>
                        
                        {/* Apply Now button (top) */}
                        {!isEmployer && (
                          <button
                            className={`jl2-apply-btn-top ${selectedJobApplied ? 'jl2-applied' : ''}`}
                            onClick={handleApplySelectedJob}
                            disabled={selectedJobApplied}
                          >
                            {selectedJobApplied ? 'Applied' : (
                              <>
                                Apply now <i className="bi bi-chevron-right" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="jl2-details-company">{selectedJob.company}</div>

                    {/* Tags */}
                    <div className="jl2-details-tags">
                      {selectedJob.location && <span className="jl2-details-tag">{selectedJob.location}</span>}
                      {selectedJob.workMode && <span className="jl2-details-tag">{selectedJob.workMode}</span>}
                      {selectedJob.salary && <span className="jl2-details-tag-highlight">{selectedJob.salary}</span>}
                      {selectedJob.employmentType && <span className="jl2-details-tag">{selectedJob.employmentType}</span>}
                    </div>
                  </div>
                </div>

                {/* Scrollable details content */}
                <div className="jl2-details-content-scroll">
                  {/* Job Summary */}
                  {selectedJob.experience || selectedJob.education || selectedJob.category ? (
                    <div className="jl2-details-section">
                      <h3 className="jl2-details-section-title">Job summary</h3>
                      <div className="jl2-summary-grid">
                        {selectedJob.experience && (
                          <div className="jl2-summary-item">
                            <span className="jl2-summary-label">Experience:</span>
                            <span className="jl2-summary-val">{selectedJob.experience}</span>
                          </div>
                        )}
                        {selectedJob.education && (
                          <div className="jl2-summary-item">
                            <span className="jl2-summary-label">Education:</span>
                            <span className="jl2-summary-val">{selectedJob.education}</span>
                          </div>
                        )}
                        {selectedJob.category && (
                          <div className="jl2-summary-item">
                            <span className="jl2-summary-label">Category:</span>
                            <span className="jl2-summary-val">{selectedJob.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Job Description */}
                  <div className="jl2-details-section">
                    <h3 className="jl2-details-section-title">Job description</h3>
                    <div
                      className="jl2-details-description-html"
                      dangerouslySetInnerHTML={{ __html: selectedJob.rawDescription || selectedJob.description }}
                    />
                  </div>

                  {/* Skills */}
                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div className="jl2-details-section">
                      <h3 className="jl2-details-section-title">Skills</h3>
                      <div className="jl2-details-skills-wrap">
                        {selectedJob.skills.map((skill: string) => (
                          <span key={skill} className="jl2-details-skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedJob.benefits && (
                    <div className="jl2-details-section">
                      <h3 className="jl2-details-section-title">Benefits &amp; Perks</h3>
                      <p className="jl2-details-text">{selectedJob.benefits}</p>
                    </div>
                  )}
                </div>

                {/* Apply Now button (bottom) */}
                {!isEmployer && (
                  <div className="jl2-details-footer">
                    <button
                      className={`jl2-apply-btn-bottom ${selectedJobApplied ? 'jl2-applied' : ''}`}
                      onClick={handleApplySelectedJob}
                      disabled={selectedJobApplied}
                    >
                      {selectedJobApplied ? 'Applied Successfully' : 'Apply now'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* CONFIRMATION MODAL */}
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
              Are you sure you want to remove <strong>{selectedJobToUnsave?.title}</strong> from your saved list?
            </p>

            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 500, flex: 1 }}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedJobToUnsave(null);
                  // Refresh list state to reset the card switch toggle if needed
                  fetchSavedJobs();
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
