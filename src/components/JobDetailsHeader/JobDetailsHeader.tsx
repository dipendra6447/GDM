"use client";
import React from 'react';
import './JobDetailsHeader.css';

interface Props {
  saved: boolean;
  onSave: () => void;
  applied: boolean;
  onApply: () => void;
  job?: any;
}

const JobDetailsHeader: React.FC<Props> = ({ saved, onSave, applied, onApply, job }) => (
  <div className="jdh-wrapper">
    {/* Logo + Info */}
    <div className="jdh-left">
      <div className="jdh-logo" aria-label={`${job?.companyName || 'Company'} logo`}>
        <span>{(job?.companyName || 'C').substring(0, 2).toUpperCase()}</span>
      </div>
      <div className="jdh-info">
        <div className="jdh-title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 className="jdh-job-title">{job?.title}</h1>
          {!job?.isActive && (
            <span className="badge bg-danger" style={{ padding: '0.4em 0.8em', fontSize: '0.85rem' }}>Closed / Expired</span>
          )}
        </div>
        <div className="jdh-company-row">
          <a href="#" className="jdh-company-name" id="jdh-company-link">
            {job?.companyName || 'Company Name Hidden'}
          </a>
        </div>
        <div className="jdh-meta-row">
          <span className="jdh-meta-item">
            <i className="bi bi-geo-alt" />
            {job?.location || 'Remote'}
          </span>
          <span className="jdh-dot" aria-hidden="true">•</span>
          <span className="jdh-meta-item">
            <i className="bi bi-building" />
            {job?.workMode || 'Hybrid'}
          </span>
          <span className="jdh-dot" aria-hidden="true">•</span>
          <span className="jdh-meta-item">
            <i className="bi bi-clock" />
            {job?.jobType || 'Full-time'}
          </span>
        </div>
        <div className="jdh-salary-row">
          <i className="bi bi-currency-dollar" />
          <span className="jdh-salary">{job?.salaryRange || 'Competitive'}</span>
        </div>
        <div className="jdh-posted-row">
          <span className="jdh-posted">
            <i className="bi bi-clock-history" />
            Posted {job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
          </span>
        </div>
      </div>
    </div>

    {/* Action buttons */}
    <div className="jdh-actions">
      <button
        onClick={onApply}
        disabled={applied || !job?.isActive}
        className={`jdh-btn-apply ${applied ? 'applied' : ''}`}
        id="jdh-apply-btn"
        style={applied ? { backgroundColor: '#64748b', borderColor: '#64748b', color: '#ffffff', cursor: 'not-allowed' } : !job?.isActive ? { backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#ffffff', cursor: 'not-allowed' } : { border: 'none' }}
        aria-label={applied ? "Applied" : !job?.isActive ? "Closed" : "Apply Now"}
      >
        {applied ? 'Applied' : !job?.isActive ? 'Closed' : 'Apply Now'}
      </button>
      <button
        className={`jdh-btn-save ${saved ? 'saved' : ''}`}
        onClick={onSave}
        type="button"
        id="jdh-save-btn"
        aria-label={saved ? 'Unsave job' : 'Save job'}
      >
        <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`} />
        {saved ? 'Saved' : 'Save Job'}
      </button>
      <button className="jdh-btn-share" type="button" id="jdh-share-btn" aria-label="Share job">
        <i className="bi bi-share" />
        Share
      </button>
    </div>
  </div>
);

export default JobDetailsHeader;
