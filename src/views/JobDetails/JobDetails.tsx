"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import './JobDetails.css';
import Newsletter from '../../components/Newsletter/Newsletter';
import JobDetailsBreadcrumb from '../../components/JobDetailsBreadcrumb/JobDetailsBreadcrumb';
import JobDetailsHeader from '../../components/JobDetailsHeader/JobDetailsHeader';
import JobDetailsTabs from '../../components/JobDetailsTabs/JobDetailsTabs';
import JobDetailsBody from '../../components/JobDetailsBody/JobDetailsBody';
import JobDetailsSidebar from '../../components/JobDetailsSidebar/JobDetailsSidebar';
import SimilarJobs from '../../components/SimilarJobs/SimilarJobs';
import JobDetailsReadyBanner from '../../components/JobDetailsReadyBanner/JobDetailsReadyBanner';
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav';
import MarketplaceHeader from '../../components/MarketplaceHeader/MarketplaceHeader';

type TabKey = 'details' | 'company' | 'reviews' | 'applicants';

const JobDetails: React.FC<{ slug?: string }> = ({ slug }) => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const isEmployer = isLoggedIn && !user?.roles?.includes(1);
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/by-slug/${slug}`);
        const json = await res.json();
        if (json.success) {
          setJob(json.data);
          
          // Fetch saved and applied status if authenticated
          const token = localStorage.getItem('token');
          if (token) {
            const [savedRes, appliedRes] = await Promise.all([
              fetch(`/api/jobs/saved/${json.data.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              fetch(`/api/jobs/${json.data.id}/apply`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
            ]);
            
            const savedJson = await savedRes.json();
            const appliedJson = await appliedRes.json();
            
            if (savedJson.success) setSaved(savedJson.saved);
            if (appliedJson.success) setApplied(appliedJson.applied);
          }
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const method = saved ? 'DELETE' : 'POST';
      const url = saved ? `/api/jobs/saved/${job.id}` : `/api/jobs/saved`;
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
        },
        ...(method === 'POST' ? { body: JSON.stringify({ jobId: job.id }) } : {})
      };
      
      const res = await fetch(url, options);
      const json = await res.json();
      
      if (json.success) {
        setSaved(!saved);
      } else {
        alert(json.message || 'Failed to update saved status');
      }
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };

  const handleApply = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (applied) return;
    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setApplied(true);
        alert('Application submitted successfully!');
      } else if (res.status === 403) {
        alert(json.message || 'Limit reached. Please buy a plan.');
        router.push('/subscription');
      } else {
        alert(json.message || 'Failed to submit application');
      }
    } catch (err) {
      console.error("Error applying to job:", err);
    }
  };

  if (loading) {
    return (
      <>
        <MarketplaceHeader />
        <main className="jd-page" id="job-details-page">
          <div className="container">
            {/* Breadcrumb skeleton */}
            <div className="skeleton-block skeleton-shimmer" style={{ width: '150px', height: '14px', marginBottom: '24px' }}></div>
            
            {/* Header skeleton */}
            <div className="skeleton-jd-header" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '24px', marginBottom: '24px' }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: '20px' }}>
                <div className="d-flex" style={{ gap: '16px', flex: 1, minWidth: '280px' }}>
                  <div className="skeleton-block skeleton-shimmer" style={{ width: '64px', height: '64px', borderRadius: '12px', flexShrink: 0 }}></div>
                  <div className="d-flex flex-column" style={{ gap: '8px', flex: 1 }}>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '50%', height: '22px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '25%', height: '14px' }}></div>
                  </div>
                </div>
                <div className="d-flex" style={{ gap: '12px', flexShrink: 0 }}>
                  <div className="skeleton-block skeleton-shimmer" style={{ width: '100px', height: '40px', borderRadius: '20px' }}></div>
                  <div className="skeleton-block skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                </div>
              </div>
            </div>

            {/* Layout: Body + Sidebar skeleton */}
            <div className="jd-layout">
              {/* Left col */}
              <div className="jd-body-col">
                <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="skeleton-block skeleton-shimmer" style={{ width: '150px', height: '18px' }}></div>
                  <div className="d-flex flex-column" style={{ gap: '10px' }}>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '100%', height: '14px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '95%', height: '14px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '90%', height: '14px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '40%', height: '14px' }}></div>
                  </div>
                  
                  <hr style={{ border: '0', borderTop: '1px solid var(--color-border)', margin: '10px 0' }} />
                  
                  <div className="skeleton-block skeleton-shimmer" style={{ width: '120px', height: '16px' }}></div>
                  <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '80px', height: '28px', borderRadius: '14px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '90px', height: '28px', borderRadius: '14px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '70px', height: '28px', borderRadius: '14px' }}></div>
                  </div>
                </div>
              </div>

              {/* Right col (sidebar) */}
              <div className="jd-sidebar-col">
                <div className="d-flex flex-column" style={{ gap: '24px' }}>
                  {/* Company card skeleton */}
                  <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '120px', height: '16px' }}></div>
                    <div className="d-flex" style={{ gap: '12px', alignItems: 'center' }}>
                      <div className="skeleton-block skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0 }}></div>
                      <div className="d-flex flex-column" style={{ gap: '6px', flex: 1 }}>
                        <div className="skeleton-block skeleton-shimmer" style={{ width: '80%', height: '14px' }}></div>
                        <div className="skeleton-block skeleton-shimmer" style={{ width: '50%', height: '12px' }}></div>
                      </div>
                    </div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '60%', height: '12px' }}></div>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '100%', height: '40px' }}></div>
                  </div>

                  {/* Job overview card skeleton */}
                  <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="skeleton-block skeleton-shimmer" style={{ width: '100px', height: '16px' }}></div>
                    <div className="d-flex flex-column" style={{ gap: '12px' }}>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="d-flex" style={{ gap: '12px', alignItems: 'center' }}>
                          <div className="skeleton-block skeleton-shimmer" style={{ width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0 }}></div>
                          <div className="d-flex flex-column" style={{ gap: '4px', flex: 1 }}>
                            <div className="skeleton-block skeleton-shimmer" style={{ width: '30%', height: '10px' }}></div>
                            <div className="skeleton-block skeleton-shimmer" style={{ width: '60%', height: '12px' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!job) {
    return (
      <>
        <MarketplaceHeader />
        <main className="jd-page" id="job-details-page">
          <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <h2>Job not found</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <MarketplaceHeader />
      <main className="jd-page" id="job-details-page">
        <div className="container">
          {/* Breadcrumb */}
          <JobDetailsBreadcrumb />

          {/* Job Header */}
          <JobDetailsHeader
            saved={saved}
            onSave={handleSave}
            applied={applied}
            onApply={handleApply}
            job={job}
            isEmployer={isEmployer}
          />

          {/* Tabs */}
          <JobDetailsTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabKey)} applicantCount={job?.applicantCount} />

          {/* Main 2-col layout */}
          <div className="jd-layout">
            {/* Left: Body */}
            <div className="jd-body-col">
              {activeTab === 'details' && <JobDetailsBody job={job} />}
              {activeTab === 'company' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <section className="jdb-section" aria-labelledby="jdb-company-about">
                    <h2 className="jdb-section-title" id="jdb-company-about">Company Overview</h2>
                    <div 
                      className="jdb-para" 
                      dangerouslySetInnerHTML={{ __html: job?.companyAbout || '<p>No company overview provided by the employer yet.</p>' }} 
                    />
                  </section>
                  
                  <section className="jdb-section" aria-labelledby="jdb-company-benefits">
                    <h2 className="jdb-section-title" id="jdb-company-benefits">Benefits & Perks</h2>
                    <div 
                      className="jdb-para" 
                      dangerouslySetInnerHTML={{ __html: job?.companyBenefits || '<p>No benefits information provided by the employer yet.</p>' }} 
                    />
                  </section>

                  <section className="jdb-section" aria-labelledby="jdb-company-details">
                    <h2 className="jdb-section-title" id="jdb-company-details">Company Details</h2>
                    <div className="row g-4">
                      <div className="col-sm-6 col-md-4">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-building text-primary" style={{ fontSize: '1.2rem' }}></i>
                          <div>
                            <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Company Name</div>
                            <div style={{ fontWeight: 600 }}>{job?.companyName || 'Company Name Hidden'}</div>
                          </div>
                        </div>
                      </div>

                      {(job?.companyIndustry || job?.category) && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-tag text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Industry</div>
                              <div style={{ fontWeight: 600 }}>{job?.companyIndustry || job?.category}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {job?.companySize && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-people text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Company Size</div>
                              <div style={{ fontWeight: 600 }}>{job?.companySize} employees</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {job?.companyFoundedYear && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-calendar-event text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Founded Year</div>
                              <div style={{ fontWeight: 600 }}>{job?.companyFoundedYear}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {job?.location && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-geo-alt text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Location</div>
                              <div style={{ fontWeight: 600 }}>{job?.location}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {job?.companyHeadquarters && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-geo text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Headquarters</div>
                              <div style={{ fontWeight: 600 }}>{job?.companyHeadquarters}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {job?.companyWebsiteUrl && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-globe text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Website</div>
                              <div style={{ fontWeight: 600 }}>
                                <a href={job.companyWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                  {job.companyWebsiteUrl.replace(/(^\w+:|^)\/\//, '')}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(job?.companyLinkedinUrl || job?.companyTwitterUrl) && (
                        <div className="col-sm-6 col-md-4">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-share text-primary" style={{ fontSize: '1.2rem' }}></i>
                            <div>
                              <div className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Social Profiles</div>
                              <div className="d-flex gap-2 mt-1">
                                {job?.companyLinkedinUrl && (
                                  <a href={job.companyLinkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary" style={{ fontSize: '1.1rem' }}>
                                    <i className="bi bi-linkedin" />
                                  </a>
                                )}
                                {job?.companyTwitterUrl && (
                                  <a href={job.companyTwitterUrl} target="_blank" rel="noopener noreferrer" className="text-dark" style={{ fontSize: '1.1rem' }}>
                                    <i className="bi bi-twitter-x" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="jd-tab-placeholder">
                  <i className="bi bi-star" />
                  <p>Reviews coming soon.</p>
                </div>
              )}
              {activeTab === 'applicants' && (
                <div className="jd-tab-placeholder">
                  <i className="bi bi-people" />
                  <p>Applicants information coming soon.</p>
                </div>
              )}
            </div>

            {/* Right: Sidebar */}
            <aside className="jd-sidebar-col" aria-label="Job sidebar">
              <JobDetailsSidebar job={job} />
            </aside>
          </div>

          {/* Similar Jobs */}
          <SimilarJobs category={job?.category} currentJobId={job?.id} />

          {/* Ready to Apply Banner */}
          {!isEmployer && (
            <JobDetailsReadyBanner
              saved={saved}
              onSave={handleSave}
              applied={applied}
              onApply={handleApply}
              jobActive={job?.isActive}
              applicantCount={job?.applicantCount}
            />
          )}
        </div>

        {/* Newsletter */}
        <Newsletter />
      </main>
      <MobileBottomNav />
    </>
  );
};

export default JobDetails;
