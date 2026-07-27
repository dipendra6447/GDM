"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import './JobListing.css';

import { useAuth } from '@/hooks/useAuth';

// Shared components
import MarketplaceHeader from '../../components/MarketplaceHeader/MarketplaceHeader';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

import MapWidget from '../../components/MapWidget/MapWidget';
import RefineSearch from '../../components/RefineSearch/RefineSearch';
import SearchResultCard from '../../components/SearchResultCard/SearchResultCard';
import SkeletonSearchResultCard from '../../components/SearchResultCard/SkeletonSearchResultCard';
import SearchPagination from '../../components/SearchPagination/SearchPagination';
import Newsletter from '../../components/Newsletter/Newsletter';
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav';

// Data
import { categoryCounts } from '../../utils/mockSearchResults';

type CategoryTab = 'all' | 'jobs' | 'gigs' | 'businesses' | 'services' | 'events';

interface TabItem {
  key: CategoryTab;
  label: string;
}

const tabs: TabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'gigs', label: 'Gigs' },
  { key: 'businesses', label: 'Businesses' },
  { key: 'services', label: 'Services' },
  { key: 'events', label: 'Events' },
];

const HEADER_HEIGHT = 74;

const JobListing: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const isEmployer = isLoggedIn && !user?.roles?.includes(1);

  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') || '');
  const [location, setLocation] = useState(() => searchParams.get('location') || 'all');
  const [distance, setDistance] = useState('25');
  const [jobType, setJobType] = useState(() => searchParams.get('jobType') || 'all');
  const [expLevel, setExpLevel] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedJobSaved, setSelectedJobSaved] = useState(false);
  const [selectedJobApplied, setSelectedJobApplied] = useState(false);

  const selectJob = async (job: any) => {
    setSelectedJob(job);
    if (!job) {
      setSelectedJobSaved(false);
      setSelectedJobApplied(false);
      return;
    }
    setSelectedJobSaved(job.isSaved);
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

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setLocation(searchParams.get('location') || 'all');
    setJobType(searchParams.get('jobType') || 'all');
  }, [searchParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const savedJobIds = new Set<string | number>();
        if (token) {
          try {
            const savedRes = await fetch('/api/jobs/saved', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const savedJson = await savedRes.json();
            if (savedJson.success && Array.isArray(savedJson.data)) {
              savedJson.data.forEach((j: any) => {
                savedJobIds.add(j.id);
                savedJobIds.add(String(j.id));
              });
            }
          } catch (err) {
            console.error("Failed to fetch saved jobs status:", err);
          }
        }

        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', '10');
        if (keyword) params.set('keyword', keyword);
        if (location && location !== 'all') params.set('location', location);
        if (jobType && jobType !== 'all') params.set('jobType', jobType);

        const res = await fetch(`/api/jobs?${params.toString()}`);
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
            isSaved: savedJobIds.has(j.id) || savedJobIds.has(String(j.id)),
          }));
          setJobs(mapped);
          setTotalPages(Math.ceil(json.meta.total / json.meta.limit) || 1);

          if (mapped.length > 0) {
            selectJob(mapped[0]);
          } else {
            selectJob(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage, keyword, location, jobType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSelectedJob = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push('/dashboard/saved');
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
        window.location.href = '/subscription-light';
      } else {
        alert(json.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error("Error applying to job:", err);
    }
  };

  const handleSaveSearch = () => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push('/dashboard/saved');
    }
  };

  return (
    <>
      {/* Marketplace-style header */}
      <MarketplaceHeader />
      <main
        className="jl2-main"
        style={{ paddingTop: `${HEADER_HEIGHT}px` }}
      >
        <Breadcrumb items={[{ label: 'Find Jobs' }]} />
        <div className="jl2-layout">
          {/* ── Center: Main Content ── */}
          <div className="jl2-center">
            {/* Search Results Header */}
            <div className="jl2-results-header">
              <div className="jl2-results-header-top d-flex justify-content-between align-items-center flex-wrap" style={{ gap: '1rem' }}>
                <div>
                  <h1 className="jl2-search-title">
                    {keyword ? (
                      <>Search results for "<span className="jl2-keyword">{keyword}</span>"</>
                    ) : (
                      <>All Available Jobs</>
                    )}
                  </h1>
                  <p className="jl2-search-meta">
                    {jobs.length} results found {location && location !== 'all' && <>in <strong>{location}</strong></>}
                  </p>
                </div>
                <button
                  onClick={handleSaveSearch}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  style={{ borderRadius: '8px', fontWeight: 600, padding: '8px 16px' }}
                  type="button"
                  id="save-jobs-btn"
                >
                  <i className="bi bi-bookmark-plus-fill"></i>
                  <span>Save Jobs</span>
                </button>
              </div>


              {/* Filter Row */}
              <div className="jl2-filter-row">
                <div className="jl2-filter-selects">
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Location</span>
                    <select
                      className="jl2-filter-select"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      aria-label="Location"
                    >
                      <option value="all">All Locations</option>
                      <option value="dayton">Dayton, OH</option>
                      <option value="columbus">Columbus, OH</option>
                      <option value="remote">Remote</option>
                      {location && location !== 'all' && location !== 'dayton' && location !== 'columbus' && location !== 'remote' && (
                        <option value={location}>{location}</option>
                      )}
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Distance</span>
                    <select
                      className="jl2-filter-select"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      aria-label="Distance"
                    >
                      <option value="10">10 miles</option>
                      <option value="25">25 miles</option>
                      <option value="50">50 miles</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Job Type</span>
                    <select
                      className="jl2-filter-select"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      aria-label="Job Type"
                    >
                      <option value="all">All Types</option>
                      <option value="full">Full-time</option>
                      <option value="part">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Experience Level</span>
                    <select
                      className="jl2-filter-select"
                      value={expLevel}
                      onChange={(e) => setExpLevel(e.target.value)}
                      aria-label="Experience Level"
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Sort by</span>
                    <select
                      className="jl2-filter-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort by"
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="newest">Newest</option>
                      <option value="salary">Highest Salary</option>
                    </select>
                  </div>
                </div>
                <button className="jl2-filter-btn" type="button">
                  <i className="bi bi-funnel" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Search Results List */}
            <div className="jl2-results-list" role="list" aria-label="Search results">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonSearchResultCard key={`skeleton-sr-${index}`} />
                ))
              ) : jobs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>No jobs found.</div>
              ) : (
                jobs.map((result) => (
                  <SearchResultCard
                    key={result.id}
                    result={result}
                    isSelected={selectedJob?.id === result.id}
                    onSelect={() => selectJob(result)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          {/* ── Right Sidebar: Job Details Box ── */}
          <aside className="jl2-right-sidebar" aria-label="Job details">
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
                          {!isEmployer && (
                            <button
                              className={`jl2-action-btn ${selectedJobSaved ? 'jl2-saved' : ''}`}
                              onClick={handleSaveSelectedJob}
                              title={selectedJobSaved ? 'Saved' : 'Save job'}
                              aria-label="Save job"
                            >
                              <i className={`bi ${selectedJobSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`} />
                            </button>
                          )}


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

        {/* Footer Newsletter */}
        <Newsletter />
      </main>
      <MobileBottomNav />
    </>
  );
};

export default JobListing;
