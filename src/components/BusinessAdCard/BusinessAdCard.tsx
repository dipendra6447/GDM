"use client";
import React from 'react';
import './BusinessAdCard.css';

export interface BusinessAdCardProps {
  businessName: string;
  category?: string;
  purpose?: string; // Tagline
  description?: string;
  offerTag?: string;
  bannerUrl?: string; // Comma separated or single URL with optional #pos=X% Y%
  positions?: string[] | string;
  ctaLabel?: string;
  ctaHref?: string;
  status?: string;
  statusBadge?: React.ReactNode;
  onCtaClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface ParsedBanner {
  url: string;
  position: string;
}

export const parseBannerUrls = (bannerUrl?: string, positions?: string[] | string): ParsedBanner[] => {
  if (!bannerUrl) return [];
  const rawList = bannerUrl.includes(',') ? bannerUrl.split(',').map((s) => s.trim()).filter(Boolean) : [bannerUrl.trim()];

  let explicitPositions: string[] = [];
  if (Array.isArray(positions)) {
    explicitPositions = positions;
  } else if (typeof positions === 'string' && positions.includes(',')) {
    explicitPositions = positions.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return rawList.map((item, idx) => {
    const [cleanUrl, hash] = item.split('#pos=');
    const posFromHash = hash ? decodeURIComponent(hash) : null;
    const posFromProp = explicitPositions[idx];
    return {
      url: cleanUrl || item,
      position: posFromHash || posFromProp || '50% 50%',
    };
  });
};

export default function BusinessAdCard({
  businessName,
  category = 'BUSINESS PROMOTION',
  purpose = 'Grow & Transform Your Enterprise',
  description,
  offerTag = '🔥 Free Consultation — Limited Slots',
  bannerUrl,
  positions,
  ctaLabel = 'View Business',
  ctaHref = '#',
  status,
  statusBadge,
  onCtaClick,
  onEdit,
  onDelete,
  className = '',
}: BusinessAdCardProps) {
  const parsedItems = parseBannerUrls(bannerUrl, positions);

  const fallbackItems: ParsedBanner[] = [
    { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', position: '50% 50%' },
    { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80', position: '50% 50%' },
    { url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&auto=format&fit=crop&q=80', position: '50% 50%' },
  ];

  const displayItems = parsedItems.length > 0 ? parsedItems : fallbackItems;

  const validHref =
    ctaHref && ctaHref !== '#'
      ? ctaHref.startsWith('http://') || ctaHref.startsWith('https://')
        ? ctaHref
        : `https://${ctaHref}`
      : '#';

  return (
    <div className={`biz-ad-card-root ${className}`}>
      {/* LEFT SECTION: COPY & DETAILS */}
      <div className="biz-ad-card-left">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="biz-ad-badge">AD</span>
            {statusBadge}
          </div>

          <div className="d-flex align-items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 border-0 px-2 py-1"
                style={{ borderRadius: '8px', fontSize: '0.8rem', background: 'rgba(67, 24, 255, 0.08)', color: '#4318ff' }}
                title="Edit Campaign"
              >
                <i className="bi bi-pencil-square" /> Edit
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 border-0 px-2 py-1"
                style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                title="Delete Campaign"
              >
                <i className="bi bi-trash3-fill" /> Delete
              </button>
            )}
          </div>
        </div>

        <div className="biz-ad-category">{category}</div>
        <h3 className="biz-ad-title">{businessName}</h3>
        {purpose && <h4 className="biz-ad-tagline">{purpose}</h4>}

        <p className="biz-ad-desc">
          {description ||
            'End-to-end digital transformation, cloud migration & enterprise software. 500+ successful projects across 40+ industries.'}
        </p>

        {offerTag && (
          <div className="biz-ad-offer-pill">
            <span>{offerTag}</span>
          </div>
        )}

        <div className="biz-ad-action">
          {onCtaClick ? (
            <button type="button" onClick={onCtaClick} className="biz-ad-btn">
              {ctaLabel} <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <a
              href={validHref}
              target={validHref !== '#' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="biz-ad-btn"
            >
              {ctaLabel} <i className="bi bi-arrow-right ms-1" />
            </a>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: COLLAGE GRID */}
      <div className="biz-ad-card-right">
        <div className="biz-ad-collage">
          {displayItems.length >= 3 ? (
            <div className="biz-ad-mosaic three-grid">
              <div className="biz-ad-main-img">
                <img
                  src={displayItems[0].url}
                  alt={businessName}
                  style={{ objectPosition: displayItems[0].position }}
                  loading="lazy"
                />
              </div>
              <div className="biz-ad-sub-stack">
                <div className="biz-ad-sub-img">
                  <img
                    src={displayItems[1].url}
                    alt={businessName}
                    style={{ objectPosition: displayItems[1].position }}
                    loading="lazy"
                  />
                </div>
                <div className="biz-ad-sub-img">
                  <img
                    src={displayItems[2].url}
                    alt={businessName}
                    style={{ objectPosition: displayItems[2].position }}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ) : displayItems.length === 2 ? (
            <div className="biz-ad-mosaic two-grid">
              <div className="biz-ad-main-img">
                <img
                  src={displayItems[0].url}
                  alt={businessName}
                  style={{ objectPosition: displayItems[0].position }}
                  loading="lazy"
                />
              </div>
              <div className="biz-ad-sub-img">
                <img
                  src={displayItems[1].url}
                  alt={businessName}
                  style={{ objectPosition: displayItems[1].position }}
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="biz-ad-mosaic single-grid">
              <div className="biz-ad-main-img full-width">
                <img
                  src={displayItems[0].url}
                  alt={businessName}
                  style={{ objectPosition: displayItems[0].position }}
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
