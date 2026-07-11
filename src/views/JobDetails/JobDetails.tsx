"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
          <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            Loading job details...
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
          />

          {/* Tabs */}
          <JobDetailsTabs activeTab={activeTab} onTabChange={(t) => setActiveTab(t as TabKey)} />

          {/* Main 2-col layout */}
          <div className="jd-layout">
            {/* Left: Body */}
            <div className="jd-body-col">
              {activeTab === 'details' && <JobDetailsBody job={job} />}
              {activeTab === 'company' && (
                <div className="jd-tab-placeholder">
                  <i className="bi bi-building" />
                  <p>Company information coming soon.</p>
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
          <SimilarJobs />

          {/* Ready to Apply Banner */}
          <JobDetailsReadyBanner
            saved={saved}
            onSave={handleSave}
            applied={applied}
            onApply={handleApply}
            jobActive={job?.isActive}
          />
        </div>

        {/* Newsletter */}
        <Newsletter />
      </main>
      <MobileBottomNav />
    </>
  );
};

export default JobDetails;
