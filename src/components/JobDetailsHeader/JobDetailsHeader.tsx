"use client";
import React from 'react';
import './JobDetailsHeader.css';

interface Props {
  saved: boolean;
  onSave: () => void;
  job?: any;
}

const JobDetailsHeader: React.FC<Props> = ({ saved, onSave, job }) => (
  <div className="jdh-wrapper">
    {/* Logo + Info */}
    <div className="jdh-left">
      <div className="jdh-logo" aria-label={`${job?.companyName || 'Company'} logo`}>
        <span>{(job?.companyName || 'C').substring(0, 2).toUpperCase()}</span>
      </div>
      <div className="jdh-info">
        <div className="jdh-title-row">
          <h1 className="jdh-job-title">{job?.title}</h1>
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
      <a
        href="#apply"
        className="jdh-btn-apply"
        id="jdh-apply-btn"
        aria-label="Apply Now for Marketing Manager"
      >
        Apply Now
      </a>
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
