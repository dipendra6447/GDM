'use client';

import React from 'react';
import Link from 'next/link';
import './PersonaCards.css';

const PersonaCards: React.FC = () => {
  return (
    <section className="persona-cards-section">
      <div className="container">
        <div className="persona-cards-grid">
          {/* Card 1: I'm Looking For Work */}
          <div className="persona-card">
            <div className="persona-icon-circle icon-circle-purple">
              <i className="bi bi-person-fill"></i>
            </div>
            <div className="persona-card-content">
              <h3 className="persona-card-title">I'm Looking For Work</h3>
              <p className="persona-card-desc">
                Find jobs, freelance opportunities, networking, events, and professional growth.
              </p>
              <Link href="/jobs" className="persona-card-link link-purple">
                Explore Opportunities <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Card 2: I'm Growing My Business */}
          <div className="persona-card">
            <div className="persona-icon-circle icon-circle-green">
              <i className="bi bi-shop"></i>
            </div>
            <div className="persona-card-content">
              <h3 className="persona-card-title">I'm Growing My Business</h3>
              <p className="persona-card-desc">
                Hire talent, promote your business, advertise services, connect with customers, and grow.
              </p>
              <Link href="/marketplace" className="persona-card-link link-green">
                Grow My Business <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Card 3: I'm Looking For Both */}
          <div className="persona-card">
            <div className="persona-icon-circle icon-circle-blue">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="persona-card-content">
              <h3 className="persona-card-title">I'm Looking For Both</h3>
              <p className="persona-card-desc">
                Manage your career and business from one account and discover everything.
              </p>
              <Link href="/register" className="persona-card-link link-blue">
                Discover Everything <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonaCards;
