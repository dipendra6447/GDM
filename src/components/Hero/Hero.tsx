'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Hero.css';

const DEFAULT_HERO_BG = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1920&auto=format&fit=crop';

const Hero: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies' | 'candidates'>('jobs');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [bannerBg, setBannerBg] = useState<string>(DEFAULT_HERO_BG);

  useEffect(() => {
    fetch('/api/config/banner')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.bannerUrl) {
          setBannerBg(data.bannerUrl);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);

    if (activeTab === 'companies') {
      router.push(`/companies?${params.toString()}`);
    } else if (activeTab === 'candidates') {
      router.push(`/seeker?${params.toString()}`);
    } else {
      router.push(`/jobs?${params.toString()}`);
    }
  };

  return (
    <section
      className="hero-banner-section"
      id="hero"
      aria-label="Hero banner section"
      style={{ backgroundImage: `url(${bannerBg})` }}
    >
      {/* Light gradient overlay for maximum readability */}
      <div className="hero-light-overlay" aria-hidden="true" />

      <div className="container position-relative hero-content-container">
        {/* ── TOP BADGE ── */}
        <div className="hero-top-badge">
          <i className="bi bi-star-fill text-warning"></i>
          <span>The All-in-One Discovery Network</span>
        </div>

        {/* ── HERO HEADING ── */}
        <h1 className="hero-main-heading">
          Discover Opportunities.
          <br />
          <span className="hero-heading-blue">Build Careers. Grow Businesses.</span>
        </h1>

        <p className="hero-sub-heading">
          The only platform built to help people and businesses connect, grow, and succeed together.
        </p>

        {/* ── FLOATING SEARCH CARD ── */}
        <div className="hero-main-search-card">
          {/* Top Row: Label + Pill Switcher */}
          <div className="hero-search-card-top-row">
            <span className="hero-card-section-label">What are you looking for?</span>
            <div className="hero-tabs-nav" role="tablist" aria-label="Search type tabs">
              <button
                className={`hero-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
                type="button"
              >
                <i className="bi bi-briefcase"></i>
                <span>Jobs</span>
              </button>
              <button
                className={`hero-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
                onClick={() => setActiveTab('companies')}
                type="button"
              >
                <i className="bi bi-building"></i>
                <span>Companies</span>
              </button>
              <button
                className={`hero-tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidates')}
                type="button"
              >
                <i className="bi bi-people"></i>
                <span>Candidates</span>
              </button>
            </div>
          </div>

          {/* Search Form Fields Grid */}
          <form onSubmit={handleSearch} role="search">
            <div className="hero-search-fields-grid">
              {/* Field 1: Keyword */}
              <div className="hero-field-group">
                <label className="hero-field-label" htmlFor="hero-keyword">
                  Keyword
                </label>
                <div className="hero-input-wrapper">
                  <i className="bi bi-search hero-input-icon"></i>
                  <input
                    id="hero-keyword"
                    type="text"
                    className="hero-field-input"
                    placeholder="Job title, skills, or company"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              {/* Field 2: Location */}
              <div className="hero-field-group">
                <label className="hero-field-label" htmlFor="hero-location">
                  Location
                </label>
                <div className="hero-input-wrapper">
                  <i className="bi bi-geo-alt hero-input-icon"></i>
                  <input
                    id="hero-location"
                    type="text"
                    className="hero-field-input"
                    placeholder="City, state, or remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* CTA Submit Button */}
              <button type="submit" className="hero-submit-btn" id="hero-search-submit">
                <span>Search Now</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
