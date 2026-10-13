"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ways = [
  {
    icon: "💼",
    iconBoxClass: "icon-box-purple",
    title: "Find Work",
    desc: "Discover jobs, gigs, and opportunities.",
  },
  {
    icon: "👥",
    iconBoxClass: "icon-box-cyan",
    title: "Find Talent",
    desc: "Connect with skilled people and businesses.",
  },
  {
    icon: "👤",
    iconBoxClass: "icon-box-blue",
    title: "Promote Yourself",
    desc: "Showcase your skills, experience, and services.",
  },
  {
    icon: "🏬",
    iconBoxClass: "icon-box-violet",
    title: "Promote Your Business",
    desc: "Increase visibility and reach new customers.",
  },
  {
    icon: "⚙️",
    iconBoxClass: "icon-box-blue",
    title: "Showcase Services",
    desc: "Let people discover what you offer.",
  },
  {
    icon: "🔗",
    iconBoxClass: "icon-box-purple",
    title: "Connect & Discover",
    desc: "Explore people, businesses, opportunities, and activity around you.",
  },
];

const PremiumBenefits: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".way-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        opacity: 0,
        y: 35,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="benefits-section" ref={sectionRef} id="benefits">
      <div className="container">
        <div className="text-start">
          <div className="sub-eyebrow mb-2">
            <span className="eyebrow-bullet">•</span> MORE THAN A SUBSCRIPTION
          </div>
          <h2 className="sub-heading">One Platform. Multiple Ways to Grow.</h2>
          <p className="sub-subheading ms-0 text-start">
            Whether you&apos;re looking for work, hiring talent, or promoting your business,
            GoDiscoverMe gives you the tools to succeed.
          </p>
        </div>

        <div className="platform-ways-grid">
          {ways.map((w, i) => (
            <div className="way-card" key={i} id={`way-${i + 1}`}>
              <div className={`way-icon-box ${w.iconBoxClass}`}>
                <span role="img" aria-label={w.title}>
                  {w.icon}
                </span>
              </div>
              <div className="way-title">{w.title}</div>
              <p className="way-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumBenefits;
