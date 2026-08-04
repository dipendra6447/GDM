"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./PromotedBusinesses.css";

/* ─── Data model ─── */
export interface PromotedBusiness {
  id: number | string;
  heroImage: string;
  accentImages?: [string, string];
  bannerUrls?: string[];
  name: string;
  category: string;
  tagline: string;
  description: string;
  offer?: string;
  ctaLabel?: string;
  ctaHref?: string;
  accent: string;
}

const STOCK_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&auto=format&fit=crop&q=80",
];

const DEFAULT_BUSINESSES: PromotedBusiness[] = [
  {
    id: 1,
    heroImage: STOCK_FALLBACK_IMAGES[0],
    accentImages: [STOCK_FALLBACK_IMAGES[1], STOCK_FALLBACK_IMAGES[2]],
    bannerUrls: STOCK_FALLBACK_IMAGES,
    name: "TechNova Solutions",
    category: "IT Services",
    tagline: "Transform Your Business With Technology",
    description: "End-to-end digital transformation, cloud migration & enterprise software. 500+ successful projects across 40+ industries.",
    offer: "🔥 Free Consultation — Limited Slots",
    ctaLabel: "View Business",
    ctaHref: "/contact?service=business-promotion",
    accent: "#2454FF",
  },
  {
    id: 2,
    heroImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
    accentImages: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&auto=format&fit=crop&q=80",
    ],
    bannerUrls: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&auto=format&fit=crop&q=80",
    ],
    name: "FitPulse Wellness",
    category: "Health & Fitness",
    tagline: "Your Strongest Self Starts Here",
    description: "State-of-the-art gym, nutrition coaching & wellness programs designed for working professionals.",
    offer: "💪 3 Months @ ₹999",
    ctaLabel: "Get Started",
    ctaHref: "/contact?service=business-promotion",
    accent: "#F43F5E",
  },
];

export type PromotedBusinessesVariant = "home" | "sidebar";

interface Props {
  variant?: PromotedBusinessesVariant;
}

const AUTO_PLAY = 5000;

const PromotedBusinesses: React.FC<Props> = ({ variant = "home" }) => {
  const isSidebar = variant === "sidebar";
  const [businesses, setBusinesses] = useState<PromotedBusiness[]>(DEFAULT_BUSINESSES);
  const [loading, setLoading] = useState<boolean>(true);

  const [idx, setIdx] = useState<number>(0);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchActivePromotions = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/promotions/active', {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: PromotedBusiness[] = json.data.map((p: any, index: number) => {
              const rawBanner = p.bannerUrl || '';
              const urls = rawBanner
                ? rawBanner.split(',').map((u: string) => u.trim()).filter(Boolean)
                : [];

              const formatUrl = (u?: string, fallbackIndex = 0) => {
                if (!u) return STOCK_FALLBACK_IMAGES[fallbackIndex % STOCK_FALLBACK_IMAGES.length];
                if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')) return u;
                return `/${u}`;
              };

              let formattedUrls = urls.map((u: string, i: number) => formatUrl(u, i)).filter(Boolean);
              if (formattedUrls.length === 0) {
                formattedUrls = STOCK_FALLBACK_IMAGES;
              }

              const category = p.category && p.category.trim() ? p.category : 'PROMOTED BUSINESS';
              const name = p.businessName && p.businessName.trim() ? p.businessName : 'Featured Business';
              const tagline = p.purpose && p.purpose.trim()
                ? p.purpose
                : (p.businessDescription && p.businessDescription.trim() ? p.businessDescription : 'Accelerate Your Growth & Enterprise Excellence');
              const description = p.businessDescription && p.businessDescription.trim()
                ? p.businessDescription
                : (p.purpose && p.purpose.trim() ? p.purpose : 'Discover leading services, innovative solutions, and customized business offerings designed to elevate your brand.');
              const offer = p.offerTag && p.offerTag.trim() ? p.offerTag : '🔥 Special Offer — Connect With Us';
              const ctaLabel = p.ctaLabel && p.ctaLabel.trim() ? p.ctaLabel : 'View Business';
              const ctaHref = p.businessContactDetails && p.businessContactDetails.trim() ? p.businessContactDetails : '/contact?service=business-promotion';

              return {
                id: p.id || index,
                name,
                category,
                tagline,
                description,
                offer,
                ctaLabel,
                ctaHref,
                heroImage: formattedUrls[0],
                accentImages: [
                  formattedUrls[1] || formattedUrls[0],
                  formattedUrls[2] || formattedUrls[0],
                ],
                bannerUrls: formattedUrls,
                accent: '#2454FF',
              };
            });
            if (isMounted) setBusinesses(mapped);
          } else if (isMounted) {
            setBusinesses(DEFAULT_BUSINESSES);
          }
        } else if (isMounted) {
          setBusinesses(DEFAULT_BUSINESSES);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && isMounted) {
          console.warn('Failed to fetch active promotions, using defaults:', err?.message || err);
          setBusinesses(DEFAULT_BUSINESSES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActivePromotions();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);


  const count = businesses.length;
  const showControls = count > 1;

  useEffect(() => {
    setIdx(0);
    setActiveImgIdx(0);
  }, [businesses]);

  const goTo = useCallback(
    (next: number) => {
      if (animating || count <= 1) return;
      setAnimating(true);
      setIdx(((next % count) + count) % count);
      setActiveImgIdx(0);
      setTimeout(() => setAnimating(false), 400);
    },
    [animating, count]
  );

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  useEffect(() => {
    if (!showControls || paused) return;
    timer.current = setTimeout(next, AUTO_PLAY);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idx, paused, next, showControls]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackIndex = 0) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = STOCK_FALLBACK_IMAGES[fallbackIndex % STOCK_FALLBACK_IMAGES.length];
  };

  /* ── 1. LOADING SKELETON STATE ── */
  if (loading) {
    if (isSidebar) {
      return (
        <div className="pb-sb-root" aria-label="Loading promoted businesses">
          <div className="pb-sb-card pb-skeleton-shimmer" />
        </div>
      );
    }

    return (
      <section className="pb-home-root" aria-label="Loading promoted businesses">
        <div className="container">
          <div className="pb-skeleton-card">
            <div className="pb-home-left" style={{ gap: '16px' }}>
              <div className="pb-skeleton-shimmer" style={{ width: '60px', height: '18px', borderRadius: '4px' }} />
              <div>
                <div className="pb-skeleton-shimmer" style={{ width: '120px', height: '16px', marginBottom: '12px' }} />
                <div className="pb-skeleton-shimmer" style={{ width: '75%', height: '30px', marginBottom: '12px' }} />
                <div className="pb-skeleton-shimmer" style={{ width: '90%', height: '20px', marginBottom: '8px' }} />
                <div className="pb-skeleton-shimmer" style={{ width: '95%', height: '16px' }} />
              </div>
              <div>
                <div className="pb-skeleton-shimmer" style={{ width: '180px', height: '28px', marginBottom: '16px', borderRadius: '20px' }} />
                <div className="pb-skeleton-shimmer" style={{ width: '150px', height: '42px', borderRadius: '50px' }} />
              </div>
            </div>
            <div className="pb-home-right">
              <div className="pb-skeleton-shimmer" style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const biz = businesses[idx] || DEFAULT_BUSINESSES[0];
  const allImages = biz.bannerUrls && biz.bannerUrls.length > 0 ? biz.bannerUrls : STOCK_FALLBACK_IMAGES;

  /* ── 2. SIDEBAR VARIANT ── */
  if (isSidebar) {
    return (
      <div
        className="pb-sb-root"
        aria-label="Promoted businesses"
        id="promoted-businesses-sidebar"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="pb-sb-head">
          <span className="pb-eyebrow">
            <span className="pb-eyebrow-dot" />
            Sponsored
          </span>
        </div>

        <a
          href={biz.ctaHref ?? "#"}
          className={`pb-sb-card ${animating ? "pb-sb-card--fade" : ""}`}
          aria-label={`Promoted: ${biz.name}`}
          id={`pb-sb-card-${biz.id}`}
          style={{ "--pb-accent": biz.accent } as React.CSSProperties}
        >
          <img
            src={allImages[activeImgIdx] || biz.heroImage}
            alt={biz.name}
            className="pb-sb-bg"
            loading="lazy"
            onError={(e) => handleImageError(e, 0)}
          />
          <div className="pb-sb-overlay" />

          <span className="pb-sb-ad-label">Ad</span>

          <div className="pb-sb-content">
            <span className="pb-sb-category">{biz.category}</span>
            <h3 className="pb-sb-name">{biz.name}</h3>
            {biz.offer && (
              <span className="pb-sb-offer">{biz.offer}</span>
            )}
          </div>
        </a>

        {showControls && (
          <div className="pb-sb-controls">
            <button className="pb-sb-arrow" onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="pb-dots">
              {businesses.map((_, i) => (
                <button
                  key={i}
                  className={`pb-dot ${i === idx ? "pb-dot--on" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button className="pb-sb-arrow" onClick={next} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── 3. HOME VARIANT (FULL split card) ── */
  return (
    <section
      className="pb-home-root"
      aria-label="Promoted businesses"
      id="promoted-businesses-home"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pb-home-header">
        <div>
          <span className="pb-eyebrow">
            <span className="pb-eyebrow-dot" />
            Sponsored
          </span>
          <h2 className="pb-home-title">Promoted Businesses</h2>
          <p className="pb-home-sub">
            Discover top businesses promoted by our premium members
          </p>
        </div>

        {showControls && (
          <div className="pb-home-arrows">
            <button className="pb-home-arrow" onClick={prev} aria-label="Previous" id="pb-home-prev">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="pb-home-arrow" onClick={next} aria-label="Next" id="pb-home-next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        className={`pb-home-card ${animating ? "pb-home-card--fade" : ""}`}
        style={{ "--pb-accent": biz.accent } as React.CSSProperties}
        id={`pb-home-card-${biz.id}`}
      >
        {/* Left: Content */}
        <div className="pb-home-left">
          <span className="pb-home-ad-label">Ad</span>

          <div>
            <span className="pb-home-category">
              {biz.category}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#2454FF" style={{ verticalAlign: 'middle', marginLeft: '4px' }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </span>
            <h3 className="pb-home-biz-name" title={biz.name}>{biz.name}</h3>
            {biz.tagline && <p className="pb-home-tagline">{biz.tagline}</p>}
            {biz.description && <p className="pb-home-desc">{biz.description}</p>}
          </div>

          <div>
            {biz.offer && (
              <div className="pb-home-offer">{biz.offer}</div>
            )}

            <div>
              <a
                href={biz.ctaHref ?? "#"}
                className="pb-home-cta"
                id={`pb-home-cta-${biz.id}`}
                aria-label={`${biz.ctaLabel || "View Business"} – ${biz.name}`}
              >
                <span>{biz.ctaLabel || "View Business"}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Mosaic */}
        <div className="pb-home-right">
          {allImages.length >= 3 ? (
            <div className="pb-home-mosaic three-mosaic">
              <div className="pb-mosaic-main" style={{ cursor: 'pointer' }} onClick={() => setActiveImgIdx(0)}>
                <img
                  src={allImages[activeImgIdx % allImages.length]}
                  alt={biz.name}
                  loading="lazy"
                  onError={(e) => handleImageError(e, activeImgIdx)}
                />
              </div>
              <div className="pb-mosaic-stack">
                <div
                  className="pb-mosaic-accent"
                  style={{ cursor: 'pointer', outline: activeImgIdx === (activeImgIdx + 1) % 3 ? '2px solid #2454ff' : 'none' }}
                  onClick={() => setActiveImgIdx((activeImgIdx + 1) % allImages.length)}
                  title="Click to feature image"
                >
                  <img
                    src={allImages[(activeImgIdx + 1) % allImages.length]}
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                    onError={(e) => handleImageError(e, 1)}
                  />
                </div>
                <div
                  className="pb-mosaic-accent"
                  style={{ cursor: 'pointer', outline: activeImgIdx === (activeImgIdx + 2) % 3 ? '2px solid #2454ff' : 'none' }}
                  onClick={() => setActiveImgIdx((activeImgIdx + 2) % allImages.length)}
                  title="Click to feature image"
                >
                  <img
                    src={allImages[(activeImgIdx + 2) % allImages.length]}
                    alt=""
                    loading="lazy"
                    aria-hidden="true"
                    onError={(e) => handleImageError(e, 2)}
                  />
                </div>
              </div>
            </div>
          ) : allImages.length === 2 ? (
            <div className="pb-home-mosaic two-mosaic">
              <div className="pb-mosaic-main" style={{ cursor: 'pointer' }} onClick={() => setActiveImgIdx(0)}>
                <img
                  src={allImages[0]}
                  alt={biz.name}
                  loading="lazy"
                  onError={(e) => handleImageError(e, 0)}
                />
              </div>
              <div className="pb-mosaic-main" style={{ cursor: 'pointer' }} onClick={() => setActiveImgIdx(1)}>
                <img
                  src={allImages[1]}
                  alt={biz.name}
                  loading="lazy"
                  onError={(e) => handleImageError(e, 1)}
                />
              </div>
            </div>
          ) : (
            <div className="pb-home-mosaic single-mosaic">
              <div className="pb-mosaic-main">
                <img
                  src={allImages[0] || biz.heroImage}
                  alt={biz.name}
                  loading="lazy"
                  onError={(e) => handleImageError(e, 0)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showControls && (
        <div className="pb-home-dots">
          {businesses.map((_, i) => (
            <button
              key={i}
              className={`pb-dot ${i === idx ? "pb-dot--on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PromotedBusinesses;
