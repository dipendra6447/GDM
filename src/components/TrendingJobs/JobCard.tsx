"use client";
import React from 'react';
import { Job } from './TrendingJobs';
import { useAuth } from '../../hooks/useAuth';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, isLoggedIn } = useAuth();

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
      aria-label={`${job.title} at ${job.company}`}
      style={{ '--apply-color': job.applyBtnColor } as React.CSSProperties}
    >
      {/* Illustration area */}
      <div className="job-card-illustration" style={{ background: job.cardBg }}>
        <img
          src={job.illustrationImg?.src || job.illustrationImg}
          alt={`${job.title} illustration`}
          className="job-card-illus-img"
          loading="lazy"
        />
        <button className="job-bookmark" aria-label={`Save ${job.title}`} id={`bookmark-${job.id}`}>
          <i className="bi bi-bookmark"></i>
        </button>
      </div>

      {/* Card body */}
      <div className="job-card-body">
        {/* Title */}
        <h3 className="job-title">{job.title}</h3>

        {/* Company row */}
        <div className="job-company-row">
          <i className={`bi ${job.companyLogo} job-company-icon`}></i>
          <span className="job-company">{job.company}</span>
        </div>

        {/* Meta: location + type */}
        <div className="job-meta">
          <span className="job-meta-item">
            <i className="bi bi-geo-alt"></i>
            {job.location}
          </span>
          <span className="job-meta-item">
            <i className="bi bi-briefcase"></i>
            {job.type}
          </span>
        </div>

        {/* Salary */}
        <div className="job-salary">{job.salary}</div>

        {/* Tags */}
        <div className="job-tags">
          {job.tags.map((tag) => (
            <span key={tag} className="job-tag">{tag}</span>
          ))}
        </div>

        {/* Apply button */}
        <a
          href="#"
          className="job-apply-btn"
          id={`apply-${job.id}`}
          aria-label={`Apply for ${job.title}`}
          onClick={handleApply}
        >
          Apply Now
        </a>
      </div>
    </article>
  );
};

export default JobCard;
