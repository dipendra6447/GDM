"use client";
import React, { useState } from 'react';
import './JobDetailsSidebar.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

interface Props {
  job?: any;
}

const JobDetailsSidebar: React.FC<Props> = ({ job }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="jds-sidebar">
      {/* Company Overview */}
      <div className="jds-card" id="jds-company-overview">
        <h2 className="jds-card-title">Company Overview</h2>
        <div className="jds-company-header">
          <div className="jds-co-logo">
            {job?.companyLogoUrl ? (
              <img 
                src={job.companyLogoUrl.startsWith('http') || job.companyLogoUrl.startsWith('/') ? job.companyLogoUrl : `${API_BASE}${job.companyLogoUrl}`} 
                alt={job.companyName} 
              />
            ) : (
              <span>{(job?.companyName || 'C').substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="jds-co-info">
            <div className="jds-co-name-row">
              <span className="jds-co-name">{job?.companyName || 'Company Name Hidden'}</span>
              <i className="bi bi-patch-check-fill jds-co-verified" aria-label="Verified" />
            </div>
            <span className="jds-co-industry">{job?.companyIndustry || job?.category || 'Not specified'}</span>
          </div>
        </div>

        <div className="jds-rating-row">
          <div className="jds-stars" aria-label="Rating 4.8 out of 5">
            {[1, 2, 3, 4].map((s) => (
              <i key={s} className="bi bi-star-fill jds-star jds-star-filled" aria-hidden="true" />
            ))}
            <i className="bi bi-star-half jds-star jds-star-filled" aria-hidden="true" />
          </div>
          <span className="jds-rating-num">4.8</span>
          <span className="jds-rating-count">(45 reviews)</span>
        </div>

        <div className="jds-co-size">
          <i className="bi bi-people" />
          {job?.companySize ? `${job.companySize} employees` : 'Company size not specified'}
        </div>

        <p className="jds-co-desc">
          {job?.companyAbout ? (
            stripHtml(job.companyAbout).substring(0, 180) + (stripHtml(job.companyAbout).length > 180 ? '...' : '')
          ) : (
            'No company overview provided by the employer yet.'
          )}
        </p>

        <a 
          href={job?.companyName ? `/jobs?keyword=${encodeURIComponent(job.companyName)}` : '/jobs'} 
          className="jds-co-profile-link" 
          id="jds-view-company"
        >
          View Company Profile <i className="bi bi-arrow-right" />
        </a>
      </div>

      {/* Job Overview */}
      <div className="jds-card" id="jds-job-overview">
        <h2 className="jds-card-title">Job Overview</h2>
        <ul className="jds-overview-list">
          <li className="jds-overview-item">
            <div className="jds-ov-icon"><i className="bi bi-clock" /></div>
            <div className="jds-ov-text">
              <span className="jds-ov-label">Posted</span>
              <span className="jds-ov-value">{job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </li>
          <li className="jds-overview-item">
            <div className="jds-ov-icon"><i className="bi bi-bar-chart" /></div>
            <div className="jds-ov-text">
              <span className="jds-ov-label">Experience</span>
              <span className="jds-ov-value">{job?.experience || 'Not specified'}</span>
            </div>
          </li>
          <li className="jds-overview-item">
            <div className="jds-ov-icon"><i className="bi bi-briefcase" /></div>
            <div className="jds-ov-text">
              <span className="jds-ov-label">Employment Type</span>
              <span className="jds-ov-value">{job?.jobType || 'Full-time'}</span>
            </div>
          </li>
          <li className="jds-overview-item">
            <div className="jds-ov-icon"><i className="bi bi-building" /></div>
            <div className="jds-ov-text">
              <span className="jds-ov-label">Work Mode</span>
              <span className="jds-ov-value">{job?.workMode || 'On-site'}</span>
            </div>
          </li>
          <li className="jds-overview-item">
            <div className="jds-ov-icon"><i className="bi bi-currency-dollar" /></div>
            <div className="jds-ov-text">
              <span className="jds-ov-label">Salary Range</span>
              <span className="jds-ov-value">{job?.salaryRange || 'Competitive'}</span>
            </div>
          </li>
          <li className="jds-overview-item">
            <div className="jds-ov-icon"><i className="bi bi-geo-alt" /></div>
            <div className="jds-ov-text">
              <span className="jds-ov-label">Location</span>
              <span className="jds-ov-value">{job?.location || 'Not specified'}</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Benefits & Perks */}
      {(job?.companyBenefits || job?.benefits) ? (
        <div className="jds-card" id="jds-benefits">
          <h2 className="jds-card-title">Benefits &amp; Perks</h2>
          {job.companyBenefits ? (
            <div 
              className="jds-benefits-content"
              dangerouslySetInnerHTML={{ __html: job.companyBenefits }}
            />
          ) : (
            <ul className="jds-benefits-list">
              {job.benefits.split(',').map((b: string) => (
                <li key={b} className="jds-benefit-item">
                  <div className="jds-benefit-icon">
                    <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  </div>
                  <span>{b.trim()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {/* Share */}
      <div className="jds-card" id="jds-share">
        <h2 className="jds-card-title">Share this job</h2>
        <div className="jds-share-row">
          <button
            className="jds-share-btn jds-share-link"
            onClick={handleCopyLink}
            aria-label="Copy job link"
            type="button"
            id="jds-copy-link"
          >
            <i className={`bi ${copied ? 'bi-check-lg' : 'bi-link-45deg'}`} />
          </button>
          <a href="https://facebook.com" className="jds-share-btn jds-share-fb" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" id="jds-share-fb">
            <i className="bi bi-facebook" />
          </a>
          <a href="https://x.com" className="jds-share-btn jds-share-x" target="_blank" rel="noopener noreferrer" aria-label="Share on X" id="jds-share-x">
            <i className="bi bi-twitter-x" />
          </a>
          <a href="https://linkedin.com" className="jds-share-btn jds-share-li" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" id="jds-share-li">
            <i className="bi bi-linkedin" />
          </a>
          <a href="#" className="jds-share-btn jds-share-email" aria-label="Share via email" id="jds-share-email">
            <i className="bi bi-envelope" />
          </a>
        </div>
      </div>

      {/* Not the right fit */}
      <div className="jds-card jds-not-fit" id="jds-not-right-fit">
        <div className="jds-not-fit-content">
          <div>
            <p className="jds-not-fit-title">Not the right fit?</p>
            <p className="jds-not-fit-desc">
              Create a profile and get matched with jobs that fit your skills and interests.
            </p>
            <a href="#" className="jds-create-profile-btn" id="jds-create-profile">
              Create Profile
            </a>
          </div>
          <div className="jds-not-fit-illustration" aria-hidden="true">
            <i className="bi bi-person-bounding-box" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSidebar;
