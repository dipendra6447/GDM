"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import subBg from "../../assets/images/subcription_bg.jpeg";

const PricingHero: React.FC = () => {
  const [particles, setParticles] = React.useState<Array<{id: number, size: number, left: number, delay: number, duration: number}>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 6 + 6,
    })));
  }, []);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(badgeRef.current, { opacity: 0, y: 30, duration: 0.7 })
        .from(titleRef.current, { opacity: 0, y: 50, duration: 0.8 }, "-=0.3")
        .from(descRef.current, { opacity: 0, y: 30, duration: 0.7 }, "-=0.4")
        .from(btnsRef.current, { opacity: 0, y: 30, duration: 0.6 }, "-=0.3");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="sub-hero"
      ref={heroRef}
      id="pricing-hero"
      style={{
        backgroundImage: `url(${subBg.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Particles */}
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

      {/* Glow Shapes */}
      <div className="hero-glow-left" aria-hidden="true" />
      <div className="hero-glow-right" aria-hidden="true" />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div ref={badgeRef} className="sub-badge">
          ✨ Premium Membership Plans
        </div>

        <h1 className="sub-hero-title" ref={titleRef}>
          Unlock More Opportunities
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #D4AF37, #B8860B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            With JobNest Premium
          </span>
        </h1>

        <p className="sub-hero-desc" ref={descRef}>
          Get unlimited job applications, premium employer tools, and business
          promotion features with flexible subscription plans.
        </p>

        <div className="sub-hero-btns" ref={btnsRef}>
          <a href="#plans" className="btn-gold" id="hero-view-plans-btn">
            View Plans <span>↓</span>
          </a>
          <a href="/contact?service=enterprise-sales" className="btn-gold-outline" id="hero-contact-sales-btn">
            Contact Sales
          </a>

        </div>
      </div>
    </section>
  );
};

export default PricingHero;
