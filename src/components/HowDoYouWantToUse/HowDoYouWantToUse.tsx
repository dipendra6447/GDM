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
  icon: string;
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
    icon: 'bi-search',
    avatar: '/images/persona_find_work.jpg',
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
    icon: 'bi-people-fill',
    avatar: '/images/persona_hire_talent.jpg',
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
    icon: 'bi-person-fill',
    avatar: '/images/persona_promote_self.jpg',
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
    icon: 'bi-buildings-fill',
    avatar: '/images/persona_grow_business.jpg',
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
        y: 30,
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
          y: 45,
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

        {/* 4 Cards Grid */}
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
                {/* Ambient Card Radial Glow */}
                <div className={`card-glow-reflection glow-${card.theme}`} aria-hidden="true" />

                {/* Top Row: Icon + Avatar */}
                <div className="goal-card-top">
                  <div className={`goal-icon-box icon-box-${card.theme}`}>
                    <i className={`bi ${card.icon}`} aria-hidden="true"></i>
                  </div>
                  <div className={`goal-avatar-wrap avatar-wrap-${card.theme}`}>
                    <Image
                      src={card.avatar}
                      alt={card.title}
                      width={64}
                      height={64}
                      className="goal-avatar-img"
                    />
                  </div>
                </div>

                {/* Card Title & Subtitle */}
                <div className="goal-card-headings">
                  <h3 className="goal-card-title">{card.title}</h3>
                  <p className="goal-card-subtitle">{card.subtitle}</p>
                </div>

                {/* Feature Checklist */}
                <ul className="goal-card-checklist">
                  {card.features.map((feat, idx) => (
                    <li key={idx} className="goal-checklist-item">
                      <span className={`checklist-check-circle check-${card.theme}`}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
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

        {/* Down Arrow Indicator */}
        <div className="htu-down-arrow-container text-center">
          <button
            type="button"
            className="htu-down-arrow-btn"
            onClick={handleScrollDown}
            aria-label="Scroll to plans and features"
            id="htu-scroll-down-btn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowDoYouWantToUse;
