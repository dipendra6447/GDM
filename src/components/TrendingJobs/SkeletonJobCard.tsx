"use client";
import React from 'react';

const SkeletonJobCard: React.FC = () => {
  return (
    <article className="job-card skeleton-card" aria-hidden="true">
      {/* Top section with badge & bookmark */}
      <div className="job-card-top">
        <div className="job-card-icon-badge skeleton-block skeleton-icon-badge skeleton-shimmer"></div>
        <div className="job-bookmark skeleton-block skeleton-bookmark-btn skeleton-shimmer"></div>
      </div>

      {/* Card body */}
      <div className="job-card-body">
        {/* Title: 2 lines */}
        <div className="skeleton-title-container">
          <div className="skeleton-block skeleton-title-line skeleton-shimmer"></div>
          <div className="skeleton-block skeleton-title-line-short skeleton-shimmer"></div>
        </div>

        {/* Company row */}
        <div className="job-company-row">
          <div className="skeleton-block skeleton-company skeleton-shimmer"></div>
        </div>

        {/* Meta: location + type */}
        <div className="job-meta">
          <div className="skeleton-block skeleton-meta-item skeleton-shimmer"></div>
          <div className="skeleton-block skeleton-meta-item skeleton-shimmer"></div>
        </div>

        {/* Salary */}
        <div className="skeleton-block skeleton-salary skeleton-shimmer"></div>

        {/* Tags */}
        <div className="job-tags">
          <div className="skeleton-block skeleton-tag skeleton-shimmer"></div>
          <div className="skeleton-block skeleton-tag skeleton-shimmer"></div>
        </div>

        {/* Apply button */}
        <div className="skeleton-block skeleton-apply-btn skeleton-shimmer"></div>
      </div>
    </article>
  );
};

export default SkeletonJobCard;
