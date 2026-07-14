"use client";
import React from 'react';
import './JobDetailsBody.css';

interface JobDetailsBodyProps {
  job?: any;
}

const JobDetailsBody: React.FC<JobDetailsBodyProps> = ({ job }) => {
  const jobMeta = [
    { icon: 'bi-briefcase', label: 'Job Type', value: job?.jobType || 'Full-time' },
    { icon: 'bi-bar-chart', label: 'Experience', value: job?.experience || 'Not specified' },
    { icon: 'bi-mortarboard', label: 'Education', value: job?.education || 'Not specified' },
    { icon: 'bi-diagram-3', label: 'Department', value: job?.category || 'Not specified' },
    { icon: 'bi-currency-dollar', label: 'Salary Range', value: job?.salaryRange || 'Competitive' },
    { icon: 'bi-heart', label: 'Benefits', value: job?.benefits || 'Not specified' },
    { icon: 'bi-geo-alt', label: 'Work Mode', value: job?.workMode || 'On-site' },
    { icon: 'bi-pin-map', label: 'Location', value: job?.location || 'Not specified' },
  ];

  return (
  <div className="jdb-body">
    {/* About the Role */}
    <section className="jdb-section" aria-labelledby="jdb-about">
      <h2 className="jdb-section-title" id="jdb-about">About the Role</h2>
      <div 
        className="jdb-para" 
        dangerouslySetInnerHTML={{ __html: job?.description || '<p>No description provided.</p>' }} 
      />
    </section>

    {job?.skills && (
      <section className="jdb-section" aria-labelledby="jdb-skills">
        <h3 className="jdb-section-sub" id="jdb-skills">Required Skills</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {job.skills.split(',').map((skill: string) => (
            <span key={skill} style={{ 
              background: 'var(--bg-light)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px',
              fontSize: '0.875rem'
            }}>
              {skill.trim()}
            </span>
          ))}
        </div>
      </section>
    )}

    {(job?.companyBenefits || job?.benefits) && (
      <section className="jdb-section" aria-labelledby="jdb-benefits">
        <h2 className="jdb-section-title" id="jdb-benefits">Benefits &amp; Perks</h2>
        <div 
          className="jdb-para" 
          dangerouslySetInnerHTML={{ __html: job?.companyBenefits || `<p>${job?.benefits}</p>` }} 
        />
      </section>
    )}

    {/* Job Summary Chips */}
    <section className="jdb-meta-grid" aria-label="Job summary">
      {jobMeta.map((m) => (
        <div className="jdb-meta-card" key={m.label}>
          <div className="jdb-meta-icon">
            <i className={`bi ${m.icon}`} aria-hidden="true" />
          </div>
          <div className="jdb-meta-text">
            <span className="jdb-meta-label">{m.label}</span>
            <span className="jdb-meta-value">{m.value}</span>
          </div>
        </div>
      ))}
    </section>

    {/* Security Note */}
    <div className="jdb-security-note" role="note">
      <div className="jdb-security-icon">
        <i className="bi bi-shield-check-fill" aria-hidden="true" />
      </div>
      <div>
        <p className="jdb-security-title">Your application is safe with us.</p>
        <p className="jdb-security-desc">
          We use advanced security to protect your data and keep your information private.
        </p>
      </div>
    </div>
  </div>
  );
};

export default JobDetailsBody;
