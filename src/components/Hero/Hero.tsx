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
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState('');

  const [activeBanners, setActiveBanners] = useState<string[]>([DEFAULT_HERO_BG]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    fetch('/api/config/banner')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.banners) && data.banners.length > 0) {
            setActiveBanners(data.banners);
          } else if (data.bannerUrl) {
            setActiveBanners([data.bannerUrl]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Auto-cycle through active banners if there are multiple
  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [activeBanners]);

  const currentBannerBg = activeBanners[currentIndex % activeBanners.length] || DEFAULT_HERO_BG;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    if (designation) params.set('designation', designation);
    if (experience) params.set('experience', experience);

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
      style={{ backgroundImage: `url(${currentBannerBg})` }}
    >
      {/* Premium dark gradient overlay */}
      <div className="hero-dark-overlay" aria-hidden="true" />

      {/* Multi-banner indicator dots if multiple active banners */}
      {activeBanners.length > 1 && (
        <div className="hero-banner-dots" aria-label="Banner slider navigation">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`hero-banner-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Switch to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}

      <div className="container position-relative hero-content-container">
        {/* ── HERO TYPOGRAPHY ── */}
        <div className="hero-text-content text-center">
          <h1 className="hero-main-heading">
            Find the Right Job.
            <br />
            Build Your <span className="hero-heading-blue">Future.</span>
          </h1>

          <p className="hero-sub-heading">
            Smart tools. Real opportunities. Trusted by millions.
          </p>
        </div>

        {/* ── FLOATING SEARCH CARD CONTAINER ── */}
        <div className="hero-search-card-outer">
          
          {/* Centered Floating Pill Tab Switcher */}
          <div className="hero-tabs-nav-wrapper">
            <div className="hero-tabs-nav" role="tablist" aria-label="Search type tabs">
              <button
                className={`hero-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
                type="button"
              >
                <i className="bi bi-search"></i>
                <span>Find Jobs</span>
              </button>
              <button
                className={`hero-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
                onClick={() => setActiveTab('companies')}
                type="button"
              >
                <i className="bi bi-building"></i>
                <span>Find Companies</span>
              </button>
              <button
                className={`hero-tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidates')}
                type="button"
              >
                <i className="bi bi-people"></i>
                <span>Find Candidates</span>
              </button>
            </div>
          </div>

          {/* Main Search Card */}
          <div className="hero-main-search-card">
            <form onSubmit={handleSearch} role="search">
              <div className="hero-search-fields-container">
                
                {/* Field 1: Keyword */}
                <div className="hero-search-field-col">
                  <div className="hero-field-icon-circle blue-circle">
                    <i className="bi bi-briefcase"></i>
                  </div>
                  <div className="hero-field-content">
                    <label htmlFor="hero-keyword" className="hero-field-title">
                      Job Title or Keyword
                    </label>
                    <input
                      id="hero-keyword"
                      type="text"
                      className="hero-field-input-clean"
                      placeholder="e.g. UI/UX Designer"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="hero-field-divider" />

                {/* Field 2: Designation */}
                <div className="hero-search-field-col">
                  <div className="hero-field-icon-circle green-circle">
                    <i className="bi bi-building"></i>
                  </div>
                  <div className="hero-field-content">
                    <label htmlFor="hero-designation" className="hero-field-title">
                      Designation
                    </label>
                    <div className="hero-select-wrapper">
                      <select
                        id="hero-designation"
                        className="hero-field-select-clean"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      >
                        <option value="">Select designation</option>
                        <option value="software-engineer">Software Engineer</option>
                        <option value="ui-ux-designer">UI/UX Designer</option>
                        <option value="product-manager">Product Manager</option>
                        <option value="data-analyst">Data Analyst</option>
                        <option value="marketing-manager">Marketing Manager</option>
                      </select>
                      <i className="bi bi-chevron-down hero-select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div className="hero-field-divider" />

                {/* Field 3: Location */}
                <div className="hero-search-field-col">
                  <div className="hero-field-icon-circle purple-circle">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div className="hero-field-content">
                    <label htmlFor="hero-location" className="hero-field-title">
                      Location
                    </label>
                    <div className="hero-select-wrapper">
                      <input
                        id="hero-location"
                        type="text"
                        className="hero-field-input-clean"
                        placeholder="City, State or Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <i className="bi bi-chevron-down hero-select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div className="hero-field-divider" />

                {/* Field 4: Experience */}
                <div className="hero-search-field-col">
                  <div className="hero-field-icon-circle yellow-circle">
                    <i className="bi bi-clock"></i>
                  </div>
                  <div className="hero-field-content">
                    <label htmlFor="hero-experience" className="hero-field-title">
                      Experience
                    </label>
                    <div className="hero-select-wrapper">
                      <select
                        id="hero-experience"
                        className="hero-field-select-clean"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      >
                        <option value="">Select experience</option>
                        <option value="0-1">Freshers (0-1 Year)</option>
                        <option value="1-3">1-3 Years</option>
                        <option value="3-5">3-5 Years</option>
                        <option value="5-10">5-10 Years</option>
                        <option value="10+">10+ Years</option>
                      </select>
                      <i className="bi bi-chevron-down hero-select-chevron"></i>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button type="submit" className="hero-search-submit-button" id="hero-search-submit">
                  <i className="bi bi-search"></i>
                  <span>Search Jobs</span>
                </button>

              </div>
            </form>

            {/* Popular Searches */}
            <div className="hero-popular-searches-row">
              <span className="hero-popular-label">Popular Searches:</span>
              <div className="hero-popular-tags">
                {['Web Developer', 'Marketing Manager', 'UI/UX Designer', 'Data Analyst', 'Sales Executive', 'Graphic Designer'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="hero-popular-tag-btn"
                    onClick={() => setKeyword(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <a href="/jobs" className="hero-browse-all-link">
                <span>Browse All</span>
                <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>

        {/* ── STATISTICS ROW ── */}
        <div className="hero-stats-row">
          <div className="hero-stat-box">
            <div className="hero-stat-icon-circle stat-blue">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="hero-stat-text">
              <div className="hero-stat-number">10M+</div>
              <div className="hero-stat-label">Active Job Seekers</div>
            </div>
          </div>

          <div className="hero-stat-box">
            <div className="hero-stat-icon-circle stat-green">
              <i className="bi bi-briefcase-fill"></i>
            </div>
            <div className="hero-stat-text">
              <div className="hero-stat-number">250K+</div>
              <div className="hero-stat-label">Companies Hiring</div>
            </div>
          </div>

          <div className="hero-stat-box">
            <div className="hero-stat-icon-circle stat-purple">
              <i className="bi bi-shield-fill-check"></i>
            </div>
            <div className="hero-stat-text">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Verified Jobs</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
