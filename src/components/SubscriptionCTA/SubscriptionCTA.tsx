"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SubscriptionCTA: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-inner > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Magnetic button effect
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, { x: dx * 0.3, y: dy * 0.3, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <section className="sub-cta-section" ref={sectionRef} id="cta">
      {/* Floating shapes */}
      <div
        className="float-shape"
        style={{
          width: 300,
          height: 300,
          top: "-20%",
          left: "-5%",
          animationDuration: "6s",
        }}
        aria-hidden="true"
      />
      <div
        className="float-shape"
        style={{
          width: 200,
          height: 200,
          bottom: "-10%",
          right: "5%",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
        aria-hidden="true"
      />

      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="cta-inner">
          <div className="cta-gold-line" />
          <h2 className="cta-heading">
            Ready To Unlock{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #D4AF37, #F5E27C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Premium Features?
            </span>
          </h2>
          <p className="cta-desc">
            Choose a plan and accelerate your hiring, job search, or business growth.
          </p>
          <div className="sub-hero-btns">
            <a
              href="#plans"
              className="btn-gold"
              id="cta-get-premium-btn"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              Get Premium ✨
            </a>
            <a
              href="/contact?service=enterprise-sales"
              className="btn-gold-outline"
              id="cta-contact-sales-btn"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              Contact Sales
            </a>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionCTA;
