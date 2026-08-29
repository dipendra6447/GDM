"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./AdPromotion.css";

interface AdPromotionProps {
  bannerVisible?: boolean;
  onBannerClose?: () => void;
}

const floatAds = [
  {
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop&q=80",
    tag: "Career Coaching",
    title: "RiseUp Career Studio",
    desc: "Mock interviews, resume & LinkedIn makeovers. 800+ placed.",
    offer: "🔥 50% OFF Today Only",
    cta: "Book Free Session →",
  },
  {
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&auto=format&fit=crop&q=80",
    tag: "Café • Downtown SF",
    title: "The Pixel Brew Café",
    desc: "Work-friendly WiFi café. Perfect for remote workers.",
    offer: "☕ Buy 1 Get 1 Free",
    cta: "Get Offer Today →",
  },
  {
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
    tag: "Online Courses",
    title: "DataWise Academy",
    desc: "Python, SQL & ML for career switchers. 1,200+ placed.",
    offer: "🎓 7-Day Free Trial",
    cta: "Start Learning Free →",
  },
  {
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
    tag: "Fitness Studio",
    title: "IronMind Fitness",
    desc: "Morning batches for working professionals. Trainer included.",
    offer: "💪 3 Months @ $29/mo",
    cta: "Grab This Deal →",
  },
];

const AdPromotion: React.FC<AdPromotionProps> = ({
  bannerVisible = true,
  onBannerClose,
}) => {
  const router = useRouter();
  const [floatingVisible, setFloatingVisible] = useState(true);
  const [adIndex, setAdIndex] = useState(0);

  // Auto-rotate floating ads
  useEffect(() => {
    if (!floatingVisible) return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % floatAds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [floatingVisible]);

  const currentAd = floatAds[adIndex];

  return (
    <>
      {/* ── Sticky Promote Bar ── */}
      {/* {bannerVisible && (
        <div
          className="sticky-promote"
          role="banner"
          aria-label="Promotion banner"
          id="sticky-promote-bar"
          onClick={() => {
            const el = document.getElementById("bizSection");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <div className="sp-text">
            <span>📣</span>
            <span>
              Promote Your Business to <strong>2.4 Lakh+</strong> Professionals
              on Orbis
            </span>
            <span className="sp-badge">Free to List</span>
            <span className="sp-badge">Any Industry</span>
          </div>
          <span className="sp-cta">Promote Now →</span>
          <button
            className="sp-close"
            onClick={(e) => {
              e.stopPropagation();
              onBannerClose?.();
            }}
            aria-label="Close promotion banner"
            id="sp-close-btn"
          >
            ✕
          </button>
        </div>
      )} */}

      {/* ── Floating Ad Widget ── */}
      {floatingVisible ? (
        <div
          className="float-ad"
          role="complementary"
          aria-label="Floating advertisement"
          id="float-ad-widget"
        >
          <button
            className="float-ad-close"
            onClick={(e) => {
              e.stopPropagation();
              setFloatingVisible(false);
            }}
            aria-label="Close floating ad"
            id="float-ad-close-btn"
          >
            ✕
          </button>
          <span className="float-ad-adlabel">Ad</span>

          <div 
            className="float-ad-img-wrap"
            onClick={() => router.push('/subscription?role=business')}
            style={{ cursor: 'pointer' }}
          >
            <img src={currentAd.img} alt={currentAd.title} loading="lazy" />
          </div>

          <div className="float-ad-body">
            <div
              onClick={() => router.push('/subscription?role=business')}
              style={{ cursor: 'pointer' }}
            >
              <div className="float-ad-tag">{currentAd.tag}</div>
              <div className="float-ad-title">{currentAd.title}</div>
              <div className="float-ad-desc">{currentAd.desc}</div>
              <div className="float-ad-offer">{currentAd.offer}</div>
            </div>
            <div>
              <button 
                className="float-ad-cta"
                onClick={() => router.push('/subscription?role=business')}
              >
                {currentAd.cta}
              </button>
              <div className="float-ad-nav">
                {floatAds.map((_, i) => (
                  <button
                    key={i}
                    className={`float-ad-dot ${i === adIndex ? "on" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setAdIndex(i);
                    }}
                    aria-label={`Go to ad ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="promote-reopen-btn"
          onClick={() => setFloatingVisible(true)}
          aria-label="Promote your business"
          id="promote-reopen-btn"
        >
          {/* Pulse ring for attention */}
          <span className="prb-pulse" aria-hidden="true" />

          {/* Megaphone icon */}
          <svg
            className="prb-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 11V13C3 14.1 3.9 15 5 15H7L11 19V5L7 9H5C3.9 9 3 9.9 3 11Z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>

          <span className="prb-label">Promote Business</span>
        </button>
      )}
    </>
  );
};

export default AdPromotion;
