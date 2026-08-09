"use client";
import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const testimonials = [
  {
    quote:
      "JobNest Premium completely transformed my job search. I applied to 40+ positions in a week and landed my dream role within 30 days. The priority visibility feature is a game-changer!",
    name: "Emily Watson",
    role: "Senior Software Engineer — Job Seeker (Austin, TX)",
    initial: "E",
  },
  {
    quote:
      "As an employer, JobNest Professional plan saved us weeks in recruitment. The recruitment dashboard and candidate shortlisting tools helped us hire 5 engineers in under 2 weeks.",
    name: "David Miller",
    role: "CTO, CloudTech Labs — Employer (San Francisco, CA)",
    initial: "D",
  },
  {
    quote:
      "The business promotion plan gave us incredible exposure. Our homepage banner drove 300% more leads in the first month. The analytics dashboard showed us exactly what was working.",
    name: "Amanda Chen",
    role: "VP of Marketing, Apex Growth — Business Promoter (New York, NY)",
    initial: "A",
  },
];

const Testimonials: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    const next = (idx + testimonials.length) % testimonials.length;
    if (trackRef.current) {
      gsap.to(trackRef.current, {
        x: `-${next * 100}%`,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
    setCurrent(next);
  };

  useEffect(() => {
    autoRef.current = setInterval(() => goTo(current + 1), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="text-center mb-5">
          <div className="sub-badge">Success Stories</div>
          <h2 className="sub-heading">
            <span className="gold-text">What Our Members Say</span>
          </h2>
        </div>

        <div className="testimonial-slider" style={{ overflow: "hidden" }}>
          <div
            ref={trackRef}
            className="testimonial-track"
            style={{ display: "flex" }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testimonial-card"
                style={{ flex: "0 0 100%", minWidth: "0" }}
                id={`testimonial-${i + 1}`}
              >
                <div className="testimonial-stars">★★★★★</div>
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.initial}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <div className="testimonial-arrows">
          <button
            className="testimonial-arrow-btn"
            onClick={() => goTo(current - 1)}
            aria-label="Previous testimonial"
            id="testimonial-prev-btn"
          >
            ←
          </button>
          <button
            className="testimonial-arrow-btn"
            onClick={() => goTo(current + 1)}
            aria-label="Next testimonial"
            id="testimonial-next-btn"
          >
            →
          </button>
        </div>

        {/* Dots */}
        <div className="testimonial-nav">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot${current === i ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              id={`testimonial-dot-${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
