"use client";
import React from 'react';
import './JobDetailsReadyBanner.css';

interface Props {
  saved: boolean;
  onSave: () => void;
  applied: boolean;
  onApply: () => void;
  jobActive?: boolean;
  applicantCount?: number;
}

const JobDetailsReadyBanner: React.FC<Props> = ({ saved, onSave, applied, onApply, jobActive = true, applicantCount = 0 }) => (
  <section className="jdrb-banner" aria-labelledby="jdrb-heading">
    <div className="jdrb-left">
      <div className="jdrb-icon-wrap" aria-hidden="true">
        <i className="bi bi-file-earmark-check" />
        <div className="jdrb-check-badge">
          <i className="bi bi-check-lg" />
        </div>
      </div>
      <div className="jdrb-text">
        <h2 className="jdrb-heading" id="jdrb-heading">Ready to apply?</h2>
        <p className="jdrb-sub">
          {applicantCount > 0 ? (
            `Join ${applicantCount} other applicant${applicantCount > 1 ? 's' : ''} who have already shown interest.`
          ) : (
            "Be the first one to show interest in this job!"
          )}
        </p>
        <div className="jdrb-security">
          <i className="bi bi-shield-check" aria-hidden="true" />
          <span>Your information is secure and private.</span>
        </div>
      </div>
    </div>
    <div className="jdrb-actions">
      <button
        onClick={onApply}
        disabled={applied || !jobActive}
        className="jdrb-btn-apply"
        id="jdrb-apply-btn"
        style={applied ? { backgroundColor: '#64748b', borderColor: '#64748b', color: '#ffffff', cursor: 'not-allowed' } : !jobActive ? { backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#ffffff', cursor: 'not-allowed' } : { border: 'none' }}
        aria-label={applied ? "Applied" : !jobActive ? "Closed" : "Apply Now"}
      >
        {applied ? 'Applied' : !jobActive ? 'Closed' : 'Apply Now'}
      </button>
      <button
        className={`jdrb-btn-save ${saved ? 'saved' : ''}`}
        onClick={onSave}
        type="button"
        id="jdrb-save-btn"
        aria-label={saved ? 'Unsave job' : 'Save job'}
      >
        <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`} />
        {saved ? 'Saved' : 'Save Job'}
      </button>
    </div>
  </section>
);

export default JobDetailsReadyBanner;
