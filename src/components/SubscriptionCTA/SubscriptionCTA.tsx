"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SubscriptionCTA: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".sub-cta-banner", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 35,
        duration: 0.7,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="sub-cta-section" ref={sectionRef} id="cta">
      <div className="container position-relative">
        <div className="sub-cta-banner">
          <div className="cta-left-content">
            <div className="cta-rocket-icon-circle" aria-hidden="true">
              🚀
            </div>
            <div>
              <div className="cta-tag">GET STARTED TODAY</div>
              <h2 className="cta-banner-title">Ready to Discover What&apos;s Next?</h2>
              <p className="cta-banner-desc">
                One account. More ways to work, grow, connect, and discover.
              </p>
            </div>
          </div>

          <div className="cta-banner-buttons">
            <Link
              href="/register"
              className="btn-cta-primary"
              id="cta-create-account-btn"
            >
              <span>👤</span> Create Your Free Account <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/register?role=business"
              className="btn-cta-secondary"
              id="cta-register-biz-btn"
            >
              <span>🏢</span> Register Your Business <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionCTA;
