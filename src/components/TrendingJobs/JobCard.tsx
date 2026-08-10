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

  // Map iconBg to theme class
  const themeClass = iconBg === '#4f1eeb' ? 'theme-purple' :
                     iconBg === '#ff7a00' ? 'theme-orange' :
                     iconBg === '#00904a' ? 'theme-green' :
                     'theme-blue';

  return (
    <Link href={`/jobs/${job.slug || job.id}`} className={`client-job-card ${themeClass}`} id={`job-card-${job.id}`}>
      {/* Hot Tag Top Right */}
      {job.isHot !== false && (
        <div className="job-hot-badge">
          <span className="hot-flame">🔥</span> Hot
        </div>
      )}

      {/* Card Header: Horizontal row with Icon Square and Text Stack */}
      <div className="job-card-header-row">
        <div
          className="job-icon-square"
          style={{ backgroundColor: iconBg }}
        >
          <i className={`bi ${iconClass}`}></i>
        </div>
        <div className="job-header-text">
          <h3 className="job-card-title" title={job.title}>
            {job.title}
          </h3>
          <div className="job-card-company-row">
            <span className="company-name">{job.companyName}</span>
            {job.isVerified !== false && (
              <i className="bi bi-patch-check-fill company-verified-tick" title="Verified Company"></i>
            )}
          </div>
        </div>
      </div>

      {/* Centered Middle Content */}
      <div className="job-card-body-centered">
        <div className="job-card-location" title={job.location}>
          {job.location}
        </div>

        <div className="job-card-salary">{job.salaryRange}</div>

        <div className="job-card-tags">
          <span className="job-pill-tag tag-purple">Full Time</span>
          {job.workMode && (
            <span className={`job-pill-tag tag-${job.workMode.toLowerCase().replace(/[^a-z]/g, '')}`}>
              {job.workMode}
            </span>
          )}
        </div>
      </div>

      {/* Footer Row (Time + Applicants) */}
      <div className="job-card-footer">
        <span className="posted-time">{job.postedTime || '2h ago'}</span>
        <span className="applicant-count">
          <i className="bi bi-people me-1"></i>
          {job.applicantCount || 0} Applicants
        </span>
      </div>
    </Link>
  );
};

export default JobCard;
