"use client";
import React, { useState } from 'react';
import './SearchResultCard.css';

export interface SearchResult {
  id: number | string;
  slug?: string;
  type: 'job' | 'gig' | 'business' | 'service' | 'event';
  title: string;
  company: string;
  companyInitials: string;
  companyColor: string;
  verified?: boolean;
  location: string;
  workMode?: string;
  employmentType?: string;
  salary?: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  openStatus?: string;
  description: string;
  skills: string[];
  postedTime: string;
  badge?: 'Featured' | 'New' | 'Top Rated' | 'Urgent';
  badgeColor?: string;
}

const ctaMap: Record<string, string> = {
  job: 'View Details',
  gig: 'View Gig',
  business: 'View Profile',
  service: 'View Service',
  event: 'View Event',
};

const ctaColorMap: Record<string, string> = {
  job: 'var(--color-primary)',
  gig: '#7B3EFF',
  business: '#14B87A',
  service: '#F59E0B',
  event: '#EF4444',
};

interface SearchResultCardProps {
  result: SearchResult;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  const [saved, setSaved] = useState(false);
  const r = result;
  const ctaColor = ctaColorMap[r.type] || 'var(--color-primary)';

  return (
    <article
      className={`sr-card ${r.badge === 'Featured' ? 'sr-card-featured' : ''}`}
      id={`sr-card-${r.id}`}
      aria-label={`${r.title} at ${r.company}`}
    >
      <div className="sr-card-inner">
        {/* Left: Company Logo */}
        <div
          className="sr-logo"
          style={{ background: `${r.companyColor}14`, color: r.companyColor }}
        >
          <span className="sr-logo-text">{r.companyInitials}</span>
        </div>

        {/* Center: Content */}
        <div className="sr-content">
          {/* Title Row */}
          <div className="sr-title-row">
            <div className="sr-title-group">
              <h3 className="sr-title">{r.title}</h3>
              {r.badge && (
                <span
                  className="sr-badge"
                  style={{
                    background: r.badge === 'Featured' ? 'rgba(36, 84, 255, 0.08)' :
                                r.badge === 'New' ? 'rgba(20, 184, 122, 0.08)' :
                                r.badge === 'Top Rated' ? 'rgba(245, 158, 11, 0.08)' :
                                'rgba(239, 68, 68, 0.08)',
                    color: r.badge === 'Featured' ? 'var(--color-primary)' :
                           r.badge === 'New' ? '#14B87A' :
                           r.badge === 'Top Rated' ? '#F59E0B' :
                           '#EF4444',
                  }}
                >
                  {r.badge}
                </span>
              )}
            </div>
            <div className="sr-right-info">
              <span className="sr-posted-time">{r.postedTime}</span>
            </div>
          </div>

          {/* Company Row */}
          <div className="sr-company-row">
            <span className="sr-company-name">{r.company}</span>
            {r.verified && (
              <i className="bi bi-patch-check-fill sr-verified" title="Verified" />
            )}
          </div>

          {/* Meta Row */}
          <div className="sr-meta-row">
            <span className="sr-meta-item">
              <i className="bi bi-geo-alt" />
              {r.location}
            </span>
            {r.workMode && (
              <>
                <span className="sr-meta-dot">&bull;</span>
                <span className="sr-meta-item">{r.workMode}</span>
              </>
            )}
            {r.employmentType && (
              <>
                <span className="sr-meta-dot">&bull;</span>
                <span className="sr-meta-item">{r.employmentType}</span>
              </>
            )}
          </div>

          {/* Salary / Price / Rating */}
          <div className="sr-info-row">
            {r.salary && <span className="sr-salary">{r.salary}</span>}
            {r.price && <span className="sr-price">{r.price}</span>}
            {r.rating !== undefined && (
              <span className="sr-rating">
                <i className="bi bi-star-fill" />
                {' '}{r.rating}
                {r.reviewCount !== undefined && <span className="sr-reviews"> ({r.reviewCount})</span>}
              </span>
            )}
            {r.openStatus && (
              <span className={`sr-open-status ${r.openStatus === 'Open now' ? 'sr-open' : ''}`}>
                {r.openStatus}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="sr-description">{r.description}</p>

          {/* Skills / Tags */}
          {r.skills.length > 0 && (
            <div className="sr-skills">
              {r.skills.slice(0, 4).map((skill) => (
                <span key={skill} className="sr-skill-tag">{skill}</span>
              ))}
              {r.skills.length > 4 && (
                <span className="sr-skill-tag sr-skill-more">+{r.skills.length - 4}</span>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="sr-actions">
          <button
            className={`sr-save-btn ${saved ? 'sr-saved' : ''}`}
            onClick={() => setSaved(!saved)}
            aria-label={saved ? `Unsave ${r.title}` : `Save ${r.title}`}
            type="button"
          >
            <i className={`bi ${saved ? 'bi-bookmark-fill' : 'bi-bookmark'}`} />
          </button>
          <a
            href={r.type === 'job' ? `/jobs/${r.slug || r.id}` : '#'}
            className="sr-cta-btn"
            style={{
              borderColor: ctaColor,
              color: ctaColor,
            }}
            id={`sr-cta-${r.id}`}
          >
            {ctaMap[r.type]}
          </a>
        </div>
      </div>

      {/* Featured glow line */}
      {r.badge === 'Featured' && <div className="sr-featured-line" />}
    </article>
  );
};

export default SearchResultCard;
