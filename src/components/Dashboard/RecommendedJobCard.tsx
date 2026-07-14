import React from 'react';
import Link from 'next/link';

interface RecommendedJobCardProps {
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string;
    salaryRange: string;
    jobType: string;
  };
  iconColor?: string; // Optional hex color for the icon background
  iconInitial?: string;
}

const RecommendedJobCard: React.FC<RecommendedJobCardProps> = ({ job, iconColor = '#2454FF', iconInitial }) => {
  const initial = iconInitial || job.companyName?.charAt(0) || '?';
  
  return (
    <div className="recommended-job-card">
      <div className="rjc-header">
        <div className="rjc-icon" style={{ backgroundColor: iconColor }}>
          {initial}
        </div>
        <div className="rjc-title-area">
          <h4 className="rjc-title">{job.title}</h4>
          <p className="rjc-company">{job.companyName || 'Unknown Company'}</p>
        </div>
      </div>
      <div className="rjc-details">
        <span className="rjc-tag"><i className="bi bi-currency-dollar"></i> {job.salaryRange || 'Competitive'}</span>
        <span className="rjc-tag"><i className="bi bi-geo-alt"></i> {job.location || 'Remote'}</span>
        <span className="rjc-tag"><i className="bi bi-briefcase"></i> {job.jobType ? job.jobType.replace('_', ' ') : 'Full Time'}</span>
      </div>
      <Link href={`/jobs/${job.id}`} className="rjc-btn">
        View Details
      </Link>
    </div>
  );
};

export default RecommendedJobCard;
