'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserRole } from '../RoleSwitcherModal/RoleSwitcherModal';
import './HowDoYouWantToUse.css';

gsap.registerPlugin(ScrollTrigger);

interface HowDoYouWantToUseProps {
  onSelectRole: (role: UserRole) => void;
}

interface PersonaGoalCard {
  id: string;
  theme: 'blue' | 'green' | 'purple' | 'orange';
  title: string;
  subtitle: string;
  avatar: string;
  features: string[];
  pricingText: string;
  btnText: string;
  targetRole: UserRole;
}

const personaCards: PersonaGoalCard[] = [
  {
    id: 'find-work',
    theme: 'blue',
    title: 'Find Work',
    subtitle: 'Jobs, gigs and opportunities',
    avatar: '/images/persona_find_work_v2.png',
    features: [
      'Browse job opportunities',
      'Find local and remote work',
      'Connect with employers',
      'Build your profile',
    ],
    pricingText: 'Free to start',
    btnText: 'View Seeker Plans',
    targetRole: 'jobseeker',
  },
  {
    id: 'hire-talent',
    theme: 'green',
    title: 'Hire Talent',
    subtitle: 'Find people with the skills you need',
    avatar: '/images/persona_hire_talent_v2.png',
    features: [
      'Post jobs and gigs',
      'Find skilled talent',
      'Manage applications',
      'Grow your team',
    ],
    pricingText: 'Plans from $29/month',
    btnText: 'View Employer Plans',
    targetRole: 'employer',
  },
  {
    id: 'promote-yourself',
    theme: 'purple',
    title: 'Promote Yourself',
    subtitle: 'Showcase your skills and services',
    avatar: '/images/persona_promote_self_v2.png',
    features: [
      'Create a standout profile',
      'Highlight your skills & services',
      'Get discovered by employers',
      'Build your network',
    ],
    pricingText: 'Free to start',
    btnText: 'View Creator Plans',
    targetRole: 'jobseeker',
  },
  {
    id: 'grow-business',
    theme: 'orange',
    title: 'Grow Your Business',
    subtitle: 'Promote your business and reach customers',
    avatar: '/images/persona_grow_business_v2.png',
    features: [
      'Create a business profile',
      'Promote your services',
      'Reach more customers',
      'Post jobs and opportunities',
    ],
    pricingText: 'Plans from $29/month',
    btnText: 'View Business Plans',
    targetRole: 'business',
  },
];

const renderGoalIcon = (theme: 'blue' | 'green' | 'purple' | 'orange') => {
  switch (theme) {
    case 'blue':
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00a8ff"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="goal-icon-svg"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="7.5" />
          <line x1="16" y1="16" x2="21.5" y2="21.5" strokeWidth="3.2" />
        </svg>
      );
    case 'green':
      return (
        <svg
          width="34"
          height="32"
          viewBox="0 0 24 24"
          fill="#22c55e"
          className="goal-icon-svg"
          aria-hidden="true"
        >
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'purple':
      return (
        <svg
          width="30"
          height="32"
          viewBox="0 0 24 24"
          fill="#c084fc"
          className="goal-icon-svg"
          aria-hidden="true"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case 'orange':
      return (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="#fb923c"
          className="goal-icon-svg"
          aria-hidden="true"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 2h2v2h-2V5zm0 4h2v2h-2V9zm-4-4h2v2H8V5zm0 4h2v2H8V9zm-4-4h2v2H4V5zm0 4h2v2H4V9zm0 8v-2h2v2H4zm4 0v-2h2v2H8zm8 0h-2v-2h2v2zm0-4h-2V9h2v4zm0-6h-2V5h2v2z" />
        </svg>
      );
  }
};

const HowDoYouWantToUse: React.FC<HowDoYouWantToUseProps> = ({ onSelectRole }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
        opacity: 0,
        y: 25,
        duration: 0.7,
        ease: 'power3.out',
      });

      // Cards staggered reveal
      const cards = cardsRef.current?.querySelectorAll('.goal-card');
      if (cards && cards.length > 0) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
          opacity: 0,
          y: 40,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (role: UserRole) => {
    onSelectRole(role);
    const plansEl = document.getElementById('plans');
    if (plansEl) {
      plansEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    const plansEl = document.getElementById('plans');
    if (plansEl) {
      plansEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="how-to-use-section"
      id="how-to-use"
      aria-label="How do you want to use GoDiscoverMe"
    >
      <div className="container-fluid position-relative htu-container">
        {/* Ambient background glows */}
        <div className="htu-ambient-glow htu-glow-blue" aria-hidden="true" />
        <div className="htu-ambient-glow htu-glow-purple" aria-hidden="true" />

        {/* Section Header */}
        <div className="htu-header text-center" ref={headerRef}>
          <h2 className="htu-title">
            How do you want to use <span className="htu-highlight">GoDiscoverMe?</span>
          </h2>
          <p className="htu-subtitle">
            Choose your primary goal to see the best plans for you. You can always access other features later.
          </p>
        </div>

        {/* 4 Cards Row matching reference mockup */}
        <div className="row g-4 justify-content-center htu-cards-row" ref={cardsRef}>
          {personaCards.map((card) => (
            <div key={card.id} className="col-12 col-sm-6 col-lg-3 d-flex">
              <div
                className={`goal-card goal-card-${card.theme}`}
                onClick={() => handleCardClick(card.targetRole)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(card.targetRole);
                  }
                }}
                aria-label={`${card.title} - ${card.subtitle}`}
              >
                {/* Ambient corner aura and concentric halo ring */}
                <div className={`card-corner-aura aura-${card.theme}`} aria-hidden="true" />
                <div className={`card-halo-ring ring-${card.theme}`} aria-hidden="true" />

                {/* Person illustration at top right */}
                <div className="goal-card-persona-wrap" aria-hidden="true">
                  <Image
                    src={card.avatar}
                    alt={card.title}
                    width={140}
                    height={130}
                    className="goal-card-persona-img"
                    priority
                  />
                </div>

                {/* Card Top: Icon & Headings */}
                <div className="goal-card-header">
                  <div className={`goal-card-icon icon-${card.theme}`}>
                    {renderGoalIcon(card.theme)}
                  </div>

                  <div className="goal-card-headings">
                    <h3 className="goal-card-title">{card.title}</h3>
                    <p className="goal-card-subtitle">{card.subtitle}</p>
                  </div>
                </div>

                {/* Feature Checklist */}
                <ul className="goal-card-checklist">
                  {card.features.map((feat, idx) => (
                    <li key={idx} className="goal-checklist-item">
                      <span className={`checklist-check-circle check-${card.theme}`}>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 8.5 6.5 12 13 4" />
                        </svg>
                      </span>
                      <span className="checklist-text">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Footer: Price Tag + CTA Button */}
                <div className="goal-card-footer">
                  <div className="goal-card-price">{card.pricingText}</div>
                  <button
                    type="button"
                    className={`btn-goal-cta btn-${card.theme}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(card.targetRole);
                    }}
                    id={`btn-goal-${card.id}`}
                  >
                    <span>{card.btnText}</span>
                    <span className="btn-arrow" aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Down Arrow Indicator at the bottom */}
        <div className="htu-down-arrow-container text-center">
          <button
            type="button"
            className="htu-down-arrow-btn"
            onClick={handleScrollDown}
            aria-label="Scroll to plans and features"
            id="htu-scroll-down-btn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00a8ff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowDoYouWantToUse;
