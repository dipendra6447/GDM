"use client";
import React from 'react';

const SkeletonSearchResultCard: React.FC = () => {
  return (
    <article className="sr-card skeleton-sr-card" aria-hidden="true">
      <div className="sr-card-inner">
        {/* Left: Company Logo */}
        <div className="sr-logo skeleton-block skeleton-sr-logo skeleton-shimmer"></div>

        {/* Center: Content */}
        <div className="sr-content">
          {/* Title Row */}
          <div className="sr-title-row">
            <div className="sr-title-group" style={{ width: '60%' }}>
              <div className="skeleton-block skeleton-sr-title skeleton-shimmer"></div>
            </div>
            <div className="sr-right-info" style={{ width: '20%' }}>
              <div className="skeleton-block skeleton-sr-posted skeleton-shimmer"></div>
            </div>
          </div>

          {/* Company Row */}
          <div className="sr-company-row">
            <div className="skeleton-block skeleton-sr-company skeleton-shimmer"></div>
          </div>

          {/* Meta Row */}
          <div className="sr-meta-row">
            <div className="skeleton-block skeleton-sr-meta skeleton-shimmer"></div>
            <div className="skeleton-block skeleton-sr-meta skeleton-shimmer"></div>
          </div>

          {/* Salary / Info */}
          <div className="sr-info-row">
            <div className="skeleton-block skeleton-sr-salary skeleton-shimmer"></div>
          </div>

          {/* Description */}
          <div className="skeleton-sr-desc-container">
            <div className="skeleton-block skeleton-sr-desc-line skeleton-shimmer"></div>
            <div className="skeleton-block skeleton-sr-desc-line-short skeleton-shimmer"></div>
          </div>

          {/* Skills / Tags */}
          <div className="sr-skills">
            <div className="skeleton-block skeleton-sr-tag skeleton-shimmer"></div>
            <div className="skeleton-block skeleton-sr-tag skeleton-shimmer"></div>
            <div className="skeleton-block skeleton-sr-tag skeleton-shimmer"></div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="sr-actions">
          <div className="skeleton-block skeleton-sr-save-btn skeleton-shimmer"></div>
          <div className="skeleton-block skeleton-sr-cta skeleton-shimmer"></div>
        </div>
      </div>
    </article>
  );
};

export default SkeletonSearchResultCard;
