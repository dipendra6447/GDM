"use client";
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ViewMode } from '../JobResultsHeader/JobResultsHeader';

export interface Job {
  id: number;
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  location: string;
  salary: string;
  experience: string;
  jobType: string;
  workMode: string;
  skills: string[];
  description: string;
  postedTime: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
  applicants?: number;
}

interface JobCardProps {
  job: Job;
  viewMode: ViewMode;
}

const workModeColors: Record<string, string> = {
  Remote: '#14B87A',
  Hybrid: '#7B3EFF',
  'On-site': '#F59E0B',
};

const jobTypeColors: Record<string, string> = {
  'Full Time': '#2454FF',
  'Part Time': '#7B3EFF',
  Contract: '#F59E0B',
  Freelance: '#14B87A',
  Internship: '#EF4444',
};

const JobCard: React.FC<JobCardProps> = ({ job, viewMode }) => {
  const { user, isLoggedIn } = useAuth();
  const isEmployer = isLoggedIn && !user?.roles?.includes(1);
  const [saved, setSaved] = useState(false);
  const modeColor = workModeColors[job.workMode] || '#6B7280';
  const typeColor = jobTypeColors[job.jobType] || '#6B7280';

  return (
    <article
      className={`job-card ${viewMode === 'list' ? 'job-card-list' : ''} ${job.isFeatured ? 'job-card-featured' : ''}`}
      role="listitem"
      id={`job-card-${job.id}`}
      aria-label={`${job.title} at ${job.company}`}
    >
      {/* Featured glow */}
      {job.isFeatured && <div className="jc-featured-glow" aria-hidden="true" />}

      {/* Header */}
      <div className="jc-header">
        <div className="jc-company-logo" style={{ background: `${job.companyColor}18`, borderColor: `${job.companyColor}30` }}>
          <span style={{ color: job.companyColor }}>{job.companyInitials}</span>
        </div>
        <div className="jc-badges">
          {job.isFeatured && (
            <span className="jc-badge jc-badge-featured" aria-label="Featured job">
              <i className="bi bi-star-fill me-1" />Featured
            </span>
          )}
          {job.isUrgent && (
            <span className="jc-badge jc-badge-urgent" aria-label="Urgently hiring">
              <i className="bi bi-lightning-fill me-1" />Urgent
            </span>
          )}
        </div>
        {!isEmployer && (
          <button
            className={`jc-save-btn ${saved ? 'saved' : ''}`}
            onClick={() => setSaved(!saved)}
            aria-label={saved ? `Unsave job: ${job.title}` : `Save job: ${job.title}`}
            id={`save-job-${job.id}`}
            type="button"
          >
            <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="jc-content">
        <h3 className="jc-title">{job.title}</h3>
        <p className="jc-company">
          <i className="bi bi-building me-1" />
          {job.company}
        </p>

        {/* Meta info */}
        <div className="jc-meta">
          <span className="jc-meta-item">
            <i className="bi bi-geo-alt" />
            {job.location}
          </span>
          <span className="jc-meta-item jc-salary">
            <i className="bi bi-currency-rupee" />
            {job.salary}
          </span>
        </div>

        {/* Type chips */}
        <div className="jc-type-row">
          <span
            className="jc-type-chip"
            style={{ color: typeColor, background: `${typeColor}12`, borderColor: `${typeColor}25` }}
          >
            <i className="bi bi-clock me-1" />{job.jobType}
          </span>
          <span
            className="jc-type-chip"
            style={{ color: modeColor, background: `${modeColor}12`, borderColor: `${modeColor}25` }}
          >
            <i className="bi bi-building me-1" />{job.workMode}
          </span>
          <span className="jc-type-chip jc-exp-chip">
            <i className="bi bi-bar-chart me-1" />{job.experience}
          </span>
        </div>

        {/* Skills */}
        <div className="jc-skills">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="jc-skill">{skill}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="jc-skill jc-skill-more">+{job.skills.length - 4}</span>
          )}
        </div>

        {/* Description */}
        <p className="jc-description">{job.description}</p>
      </div>

      {/* Footer */}
      <div className="jc-footer">
        <div className="jc-footer-left">
          <span className="jc-posted">
            <i className="bi bi-clock me-1" />
            {job.postedTime}
          </span>
          {job.applicants !== undefined && (
            <span className="jc-applicants">
              <i className="bi bi-people me-1" />
              {job.applicants} applicants
            </span>
          )}
        </div>
        {!isEmployer ? (
          <a
            href="#"
            className="jc-apply-btn"
            id={`apply-job-${job.id}`}
            aria-label={`Apply for ${job.title} at ${job.company}`}
          >
            Apply Now
            <i className="bi bi-arrow-right ms-2" />
          </a>
        ) : (
          <span className="jc-apply-btn disabled-btn" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            Employer Account
          </span>
        )}
      </div>
    </article>
  );
};

export default JobCard;
