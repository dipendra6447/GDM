"use client";
import React, { useEffect, useState } from 'react';
import './SimilarJobs.css';

interface SimilarJobsProps {
  category?: string;
  currentJobId?: number;
}

const COLORS = ['#2454FF', '#F59E0B', '#14B87A', '#7B3EFF', '#EF4444', '#EC4899'];
const getColorForCompany = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const getInitials = (name: string) => {
  return (name || 'C').substring(0, 2).toUpperCase();
};

const SimilarJobs: React.FC<SimilarJobsProps> = ({ category, currentJobId }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      try {
        const query = category ? `?category=${encodeURIComponent(category)}&limit=10` : '?limit=10';
        const res = await fetch(`/api/jobs${query}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const filtered = json.data
            .filter((j: any) => j.id !== currentJobId)
            .slice(0, 4);
          setJobs(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch similar jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilarJobs();
  }, [category, currentJobId]);

  if (loading) {
    return (
      <section className="sj-section" aria-labelledby="sj-heading">
        <div className="sj-header">
          <h2 className="sj-heading" id="sj-heading">Similar Jobs</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
          Loading similar jobs...
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="sj-section" aria-labelledby="sj-heading">
      <div className="sj-header">
        <h2 className="sj-heading" id="sj-heading">Similar Jobs</h2>
        <a href="/jobs" className="sj-view-all" id="sj-view-all">
          View all jobs <i className="bi bi-arrow-right" />
        </a>
      </div>

      <div className="sj-grid">
        {jobs.map((job) => {
          const color = getColorForCompany(job.companyName || '');
          const initials = getInitials(job.companyName || '');
          const postedTime = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently';
          return (
            <article key={job.id} className="sj-card" id={`sj-card-${job.id}`} aria-label={`${job.title} at ${job.companyName}`}>
              <div className="sj-card-header">
                <div
                  className="sj-logo"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <span style={{ color: color }}>{initials}</span>
                </div>
                <span className="sj-posted">{postedTime}</span>
              </div>
              <div className="sj-card-body">
                <h3 className="sj-title">{job.title}</h3>
                <p className="sj-company">{job.companyName}</p>
                <p className="sj-location">
                  <i className="bi bi-geo-alt" />
                  {job.location || 'Not specified'}
                </p>
                <p className="sj-salary">
                  <i className="bi bi-currency-dollar" />
                  {job.salaryRange || 'Competitive'}
                </p>
              </div>
              <div className="sj-card-footer">
                <span className="sj-type-chip">{job.jobType || 'Full-time'}</span>
                <a
                  href={`/jobs/${job.slug}`}
                  className="sj-apply-btn"
                  id={`sj-apply-${job.id}`}
                  aria-label={`Apply for ${job.title}`}
                >
                  Apply <i className="bi bi-arrow-right" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarJobs;
