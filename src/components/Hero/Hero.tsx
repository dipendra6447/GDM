"use client";
import React, { useState } from "react";
import "./Hero.css";
import heroBg from "../../assets/images/hero_city_bg.png";

const popularSearches = [
  "Web Developer",
  "Marketing Agency",
  "Graphics",
  "Saloon",
  "UI/UX Designer",
];

const Hero: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ keyword, location, category });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, email2 });
  };

  return (
    <section
      className="hero-banner-section"
      id="hero"
      aria-label="Hero banner section"
      style={{ backgroundImage: `url(${heroBg.src})` }}
    >
      {/* Left-to-right gradient overlay */}
      <div className="hero-gradient-overlay" aria-hidden="true" />

      <div className="container h-100 position-relative">
        <div className="row align-items-center h-100 gy-4">
          {/* ── LEFT COLUMN ── */}
          <div className="col-lg-10 hero-content-left">
            {/* Badge */}
            <div className="hero-guarantee-badge">
              <span className="hero-badge-dot" aria-hidden="true" />
              Guaranteed Results.
            </div>

            {/* Heading */}
            <h1 className="hero-main-heading">
              Join Millions. Find Your
              <br />
              Better <span className="hero-heading-blue">Job.</span>
            </h1>

            {/* Sub-heading */}
            <p className="hero-sub-heading">
              Smart Tools. Targeted Search. Guaranteed Results.
            </p>

            {/* Trust pills */}
            <div className="hero-trust-pills" role="list">
              <div className="trust-pill" role="listitem">
                <span className="pill-dot green" aria-hidden="true" />
                100% Free To Explore
              </div>
              <div className="trust-pill" role="listitem">
                <span className="pill-dot green" aria-hidden="true" />
                Trusted By Thousands
              </div>
              <div className="trust-pill" role="listitem">
                <span className="pill-dot green" aria-hidden="true" />
                Secure The Job
              </div>
            </div>

            {/* ── Job Search Box ── */}
            <div className="hero-search-box">
              <form
                onSubmit={handleSearch}
                role="search"
                aria-label="Job search form"
              >
                <div className="hero-search-fields">
                  {/* What? */}
                  <div className="hero-search-field">
                    <label className="hero-search-label" htmlFor="hero-keyword">
                      What?
                    </label>
                    <input
                      id="hero-keyword"
                      type="text"
                      className="hero-search-input"
                      placeholder="Job, Company, Title..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      aria-label="Job title or keyword"
                    />
                    <i
                      className="bi bi-chevron-down hero-field-arrow"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="hero-field-sep" aria-hidden="true" />

                  {/* Where? */}
                  <div className="hero-search-field">
                    <label
                      className="hero-search-label"
                      htmlFor="hero-location"
                    >
                      What?
                    </label>
                    <input
                      id="hero-location"
                      type="text"
                      className="hero-search-input"
                      placeholder="Job, Company, Title..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      aria-label="Location"
                    />
                    <i
                      className="bi bi-chevron-down hero-field-arrow"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="hero-field-sep" aria-hidden="true" />

                  {/* Category */}
                  <div className="hero-search-field">
                    <label
                      className="hero-search-label"
                      htmlFor="hero-category"
                    >
                      What?
                    </label>
                    <input
                      id="hero-category"
                      type="text"
                      className="hero-search-input"
                      placeholder="Job, Company, Title..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      aria-label="Category"
                    />
                    <i
                      className="bi bi-chevron-down hero-field-arrow"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="hero-search-btn"
                    id="hero-search-submit"
                    aria-label="Search jobs"
                  >
                    <i className="bi bi-search" aria-hidden="true" />
                    Search Jobs
                  </button>
                </div>
              </form>

              {/* Popular searches */}
              <div className="hero-popular-row">
                <span className="hero-popular-label">Popular Searches:</span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    className="hero-popular-tag"
                    id={`popular-hero-${term
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    type="button"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Login / Invite Form ── */}
          {/* <div className="col-lg-5 d-flex justify-content-end align-items-center">
            <div className="hero-login-card" aria-label="Invite your team">

              <div className="login-avatar-stack" aria-hidden="true">
                <span className="login-avatar">👩‍💼</span>
                <span className="login-avatar">👨‍💻</span>
                <span className="login-avatar">👩‍🔬</span>
              </div>

              <h2 className="login-card-title">Invite your team</h2>
              <p className="login-card-desc">
                You've created a new project. Invite colleagues to collaborate on this project.
              </p>

              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="login-field-group">
                  <label className="login-field-label" htmlFor="invite-email-1">Email address</label>
                  <div className="login-input-wrap">
                    <i className="bi bi-envelope login-input-icon" aria-hidden="true" />
                    <input
                      id="invite-email-1"
                      type="email"
                      className="login-input"
                      placeholder="you@untitled.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      aria-label="First team member email"
                    />
                  </div>
                </div>

                <div className="login-field-group">
                  <div className="login-input-wrap">
                    <i className="bi bi-envelope login-input-icon" aria-hidden="true" />
                    <input
                      id="invite-email-2"
                      type="email"
                      className="login-input"
                      placeholder="you@untitled.com"
                      value={email2}
                      onChange={e => setEmail2(e.target.value)}
                      aria-label="Second team member email"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="login-add-another"
                  id="add-another-email-btn"
                >
                  <i className="bi bi-plus-lg" aria-hidden="true" /> Add another
                </button>

                <div className="login-actions">
                  <button
                    type="button"
                    className="login-btn-cancel"
                    id="invite-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="login-btn-submit"
                    id="invite-submit-btn"
                  >
                    Get started
                  </button>
                </div>
              </form>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
