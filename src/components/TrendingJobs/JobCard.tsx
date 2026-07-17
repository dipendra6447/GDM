"use client";
import React from 'react';
import { Job } from './TrendingJobs';
import { useAuth } from '../../hooks/useAuth';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, isLoggedIn } = useAuth();
  const isEmployer = isLoggedIn && !user?.roles?.includes(1);

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    const completion = user?.profileCompletion || 0;
    if (completion < 50) {
      alert("Please complete your profile to apply for this job.");
      window.location.href = '/profile';
      return;
    }
    // Proceed with application logic (future implementation)
    alert(`Successfully applied for ${job.title}!`);
  };

  return (
    <article
      className="job-card"
      id={`job-card-${job.id}`}
      aria-label={`${job.title} at ${job.companyName}`}
      style={{ '--apply-color': job.applyBtnColor } as React.CSSProperties}
    >
      {/* Top section with icon badge */}
      <div className="job-card-top">
        <div className="job-card-icon-badge" style={{ backgroundColor: `${job.applyBtnColor}1a`, color: job.applyBtnColor }}>
          <i className="bi bi-briefcase"></i>
        </div>
        {!isEmployer && (
          <button className="job-bookmark" aria-label={`Save ${job.title}`} id={`bookmark-${job.id}`}>
            <i className="bi bi-bookmark"></i>
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="job-card-body">
        {/* Title */}
        <h3 className="job-title">{job.title}</h3>

        {/* Company row */}
        <div className="job-company-row">
          <i className={`bi bi-building job-company-icon`}></i>
          <span className="job-company">{job.companyName}</span>
        </div>

        {/* Meta: location + type */}
        <div className="job-meta">
          <span className="job-meta-item">
            <i className="bi bi-geo-alt"></i>
            {job.location}
          </span>
          <span className="job-meta-item">
            <i className="bi bi-briefcase"></i>
            {job.jobType}
          </span>
        </div>

        {/* Salary */}
        <div className="job-salary">{job.salaryRange}</div>

        {/* Tags */}
        <div className="job-tags">
          {job.tags?.map((tag) => (
            <span key={tag} className="job-tag">{tag}</span>
          ))}
        </div>

        {/* Apply button */}
        <a
          href={`/jobs/${job.slug}`}
          className="job-apply-btn"
          id={`apply-${job.id}`}
          aria-label={`View ${job.title}`}
        >
          View Job
        </a>
      </div>
    </article>
  );
};

export default JobCard;
