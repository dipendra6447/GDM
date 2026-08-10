'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export interface JobCardData {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  workMode?: string;
  salaryRange: string;
  category?: string;
  tags?: string[];
  iconBg?: string;
  iconColor?: string;
  iconClass?: string;
  postedTime?: string;
  applicantCount?: number;
  isVerified?: boolean;
  isHot?: boolean;
  buttonColor?: string;
}

interface JobCardProps {
  job: JobCardData;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, isLoggedIn } = useAuth();

  const iconBg = job.iconBg || '#ede9fe';
  const iconColor = job.iconColor || '#6d28d9';
  const iconClass = job.iconClass || 'bi-briefcase-fill';
  const buttonColor = job.buttonColor || job.iconBg || '#3b82f6';

  // Combine jobType, workMode, and skills into a clean tag array
  const displayTags = [
    job.jobType,
    job.workMode,
    ...(job.tags || []),
  ].filter(Boolean) as string[];

  return (
    <article className="client-job-card" id={`job-card-${job.id}`}>
      {/* Hot Tag Top Right */}
      {job.isHot !== false && (
        <div className="job-hot-badge">
          <span className="hot-flame">🔥</span> Hot
        </div>
      )}

      {/* Card Header: Icon Square */}
      <div className="job-card-header-icon">
        <div
          className="job-icon-square"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <i className={`bi ${iconClass}`}></i>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="job-card-content">
        <h3 className="job-card-title" title={job.title}>
          {job.title}
        </h3>

        <div className="job-card-company-row">
          <i className="bi bi-building me-1 text-muted" style={{ fontSize: '13px' }}></i>
          <span className="company-name">{job.companyName}</span>
          {job.isVerified !== false && (
            <i className="bi bi-patch-check-fill company-verified-tick" title="Verified Company"></i>
          )}
        </div>

        <div className="job-card-location">
          <i className="bi bi-geo-alt me-1"></i>
          {job.location}
        </div>

        <div className="job-card-salary">{job.salaryRange}</div>

        {/* Skill Tags (Fixed height container) */}
        <div className="job-card-tags">
          {displayTags.slice(0, 5).map((t, idx) => (
            <span key={idx} className="job-pill-tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Pinned Bottom Action Button */}
      <div className="job-card-action">
        <Link
          href={`/jobs/${job.slug || job.id}`}
          className="btn-view-job"
          style={{ backgroundColor: buttonColor }}
          id={`view-job-btn-${job.id}`}
        >
          View Job
        </Link>
      </div>
    </article>
  );
};

export default JobCard;
