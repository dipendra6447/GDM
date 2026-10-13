"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

const PricingHero: React.FC = () => {
  const [particles, setParticles] = React.useState<
    Array<{ id: number; size: number; left: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        size: Math.random() * 3 + 2,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 6 + 6,
      }))
    );
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(badgeRef.current, { opacity: 0, y: 25, duration: 0.6 })
        .from(titleRef.current, { opacity: 0, y: 35, duration: 0.7 }, "-=0.3")
        .from(descRef.current, { opacity: 0, y: 25, duration: 0.6 }, "-=0.4")
        .from(badgesRef.current, { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
        .from(btnsRef.current, { opacity: 0, y: 20, duration: 0.5 }, "-=0.3")
        .from(stageRef.current, { opacity: 0, scale: 0.92, duration: 0.8 }, "-=0.6");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="sub-hero" ref={heroRef} id="pricing-hero">
      {/* Background Ambience & Particles */}
      <div className="hero-particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="hero-particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-glow-left" aria-hidden="true" />
      <div className="hero-glow-right" aria-hidden="true" />
      <div className="hero-glow-center" aria-hidden="true" />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center g-4 g-lg-5">
          {/* Left Column: Heading, Copy, Features, CTAs */}
          <div className="col-12 col-lg-5 col-xl-5 text-start">
            <div ref={badgeRef} className="sub-eyebrow mb-3">
              <span className="eyebrow-bullet">•</span> PLANS FOR EVERY GOAL
            </div>

            <h1 className="sub-hero-title mb-3" ref={titleRef}>
              Choose Your
              <br />
              <span className="hero-brand-highlight">GoDiscoverMe</span> Plan
            </h1>

            <p className="sub-hero-desc mb-4" ref={descRef}>
              Access the tools you need to find opportunities, showcase your skills,
              grow your business, connect with people, and get discovered — all in one place.
            </p>

            {/* Feature Badges in Row */}
            <div className="hero-feature-pills mb-4" ref={badgesRef}>
              <div className="hero-feature-pill">
                <span className="pill-icon">💼</span>
                <span>More Opportunities</span>
              </div>
              <div className="hero-feature-pill">
                <span className="pill-icon">👁️</span>
                <span>More Visibility</span>
              </div>
              <div className="hero-feature-pill">
                <span className="pill-icon">🚀</span>
                <span>More Growth</span>
              </div>
            </div>

            <div className="hero-subtext mb-4">
              Start free. Upgrade when you&apos;re ready.
            </div>

            <div className="sub-hero-btns" ref={btnsRef}>
              <a href="#plans" className="btn-electric-primary" id="hero-view-plans-btn">
                View Plans <span className="btn-arrow">↓</span>
              </a>
              <a
                href="/contact?service=enterprise-sales"
                className="btn-electric-outline"
                id="hero-contact-sales-btn"
              >
                Contact Sales
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Stage with Coworkers and Floating Chips */}
          <div className="col-12 col-lg-7 col-xl-7 text-center">
            <div className="hero-visual-stage" ref={stageRef}>
              {/* Glowing circular neon ring */}
              <div className="hero-neon-portal" aria-hidden="true" />

              {/* Coworkers photo in circular portal */}
              <div className="hero-people-container">
                <Image
                  src="/images/pricing_hero_coworkers.jpg"
                  alt="GoDiscoverMe Community & Opportunities"
                  width={800}
                  height={680}
                  priority
                  className="hero-coworkers-photo"
                />
                <div className="hero-photo-fade-bottom" aria-hidden="true" />
              </div>

              {/* 4 Floating Glass Cards matching reference image */}
              {/* Chip 1: Top-Left - Find Work */}
              <div className="floating-hero-chip chip-top-left">
                <div className="chip-icon-box chip-blue">
                  👥
                </div>
                <div className="chip-text">
                  <div className="chip-title">Find Work</div>
                  <div className="chip-sub">Jobs, gigs &amp; opportunities</div>
                </div>
              </div>

              {/* Chip 2: Top-Right - Hire Talent */}
              <div className="floating-hero-chip chip-top-right">
                <div className="chip-icon-box chip-green">
                  👥
                </div>
                <div className="chip-text">
                  <div className="chip-title">Hire Talent</div>
                  <div className="chip-sub">Post jobs &amp; find the right people</div>
                </div>
              </div>

              {/* Chip 3: Bottom-Left - Promote Yourself */}
              <div className="floating-hero-chip chip-bottom-left">
                <div className="chip-icon-box chip-purple">
                  👤
                </div>
                <div className="chip-text">
                  <div className="chip-title">Promote Yourself</div>
                  <div className="chip-sub">Showcase your skills &amp; experience</div>
                </div>
              </div>

              {/* Chip 4: Bottom-Right - Grow Your Business */}
              <div className="floating-hero-chip chip-bottom-right">
                <div className="chip-icon-box chip-violet">
                  📊
                </div>
                <div className="chip-text">
                  <div className="chip-title">Grow Your Business</div>
                  <div className="chip-sub">Increase visibility and reach customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingHero;
