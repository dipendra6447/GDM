"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./PromotedBusinesses.css";

/* ─── Data model ─── */
export interface PromotedBusiness {
  id: number;
  /** Main hero image (large, right side on home) */
  heroImage: string;
  /** Two smaller accent images for mosaic (home only) */
  accentImages?: [string, string];
  name: string;
  category: string;
  tagline: string;
  description: string;
  offer?: string;
  ctaLabel?: string;
  ctaHref?: string;
  accent: string;
}

const PROMOTED_BUSINESSES: PromotedBusiness[] = [
  {
    id: 1,
    heroImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
    accentImages: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&auto=format&fit=crop&q=80",
    ],
    name: "TechNova Solutions",
    category: "IT Services",
    tagline: "Transform Your Business With Technology",
    description:
      "End-to-end digital transformation, cloud migration & enterprise software. 500+ successful projects across 40+ industries.",
    offer: "🔥 Free Consultation — Limited Slots",
    ctaLabel: "View Business",
    ctaHref: "#",
    accent: "#2454FF",
  },
  {
    id: 2,
    heroImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80",
    accentImages: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&auto=format&fit=crop&q=80",
    ],
    name: "FitPulse Wellness",
    category: "Health & Fitness",
    tagline: "Your Strongest Self Starts Here",
    description:
      "State-of-the-art gym, nutrition coaching & wellness programs designed for working professionals.",
    offer: "💪 3 Months @ ₹999",
    ctaLabel: "Get Started",
    ctaHref: "#",
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
  const count = PROMOTED_BUSINESSES.length;
  const showControls = count > 1;

  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setIdx(((next % count) + count) % count);
      setTimeout(() => setAnimating(false), 500);
    },
    [animating, count]
  );

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  useEffect(() => {
    if (!showControls || paused) return;
    timer.current = setTimeout(next, AUTO_PLAY);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idx, paused, next, showControls]);

  const biz = PROMOTED_BUSINESSES[idx];

  /* ── SIDEBAR VARIANT ── */
  if (isSidebar) {
    return (
      <div
        className="pb-sb-root"
        aria-label="Promoted businesses"
        id="promoted-businesses-sidebar"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Header */}
        <div className="pb-sb-head">
          <span className="pb-eyebrow">
            <span className="pb-eyebrow-dot" />
            Sponsored
          </span>
        </div>

        {/* Full-image clickable card */}
        <a
          href={biz.ctaHref ?? "#"}
          className={`pb-sb-card ${animating ? "pb-sb-card--fade" : ""}`}
          aria-label={`Promoted: ${biz.name}`}
          id={`pb-sb-card-${biz.id}`}
          style={{ "--pb-accent": biz.accent } as React.CSSProperties}
        >
          {/* Background image */}
          <img
            src={biz.heroImage}
            alt={biz.name}
            className="pb-sb-bg"
            loading="lazy"
          />
          {/* Dark gradient overlay */}
          <div className="pb-sb-overlay" />

          {/* Top: Ad label */}
          <span className="pb-sb-ad-label">Ad</span>

          {/* Bottom: content */}
          <div className="pb-sb-content">
            <span className="pb-sb-category">{biz.category}</span>
            <h3 className="pb-sb-name">{biz.name}</h3>
            {biz.offer && (
              <span className="pb-sb-offer">{biz.offer}</span>
            )}
          </div>
        </a>

        {/* Controls */}
        {showControls && (
          <div className="pb-sb-controls">
            <button className="pb-sb-arrow" onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="pb-dots">
              {PROMOTED_BUSINESSES.map((_, i) => (
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

  /* ── HOME VARIANT ── */
  return (
    <section
      className="pb-home-root"
      aria-label="Promoted businesses"
      id="promoted-businesses-home"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Section header */}
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

      {/* Full-width card */}
      <div
        className={`pb-home-card ${animating ? "pb-home-card--fade" : ""}`}
        style={{ "--pb-accent": biz.accent } as React.CSSProperties}
        id={`pb-home-card-${biz.id}`}
      >
        {/* ── LEFT: Text content ── */}
        <div className="pb-home-left">
          {/* Ad label */}
          <span className="pb-home-ad-label">Ad</span>

          <span className="pb-home-category">{biz.category}</span>
          <h3 className="pb-home-biz-name">{biz.name}</h3>
          <p className="pb-home-tagline">{biz.tagline}</p>
          <p className="pb-home-desc">{biz.description}</p>

          {biz.offer && (
            <div className="pb-home-offer">{biz.offer}</div>
          )}

          <a
            href={biz.ctaHref ?? "#"}
            className="pb-home-cta"
            id={`pb-home-cta-${biz.id}`}
            aria-label={`${biz.ctaLabel ?? "View Business"} – ${biz.name}`}
          >
            {biz.ctaLabel ?? "View Business"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        {/* ── RIGHT: Image mosaic ── */}
        <div className="pb-home-right">
          <div className="pb-home-mosaic">
            {/* Main large image */}
            <div className="pb-mosaic-main">
              <img src={biz.heroImage} alt={biz.name} loading="lazy" />
            </div>
            {/* Two stacked accent images */}
            {biz.accentImages && (
              <div className="pb-mosaic-stack">
                <div className="pb-mosaic-accent">
                  <img src={biz.accentImages[0]} alt="" loading="lazy" aria-hidden="true" />
                </div>
                <div className="pb-mosaic-accent">
                  <img src={biz.accentImages[1]} alt="" loading="lazy" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dots – only when multiple */}
      {showControls && (
        <div className="pb-home-dots">
          {PROMOTED_BUSINESSES.map((_, i) => (
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
