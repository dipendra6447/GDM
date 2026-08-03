"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (designation) params.set("keyword", designation);
    if (location) params.set("location", location);
    if (experience) params.set("experience", experience);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section
      className="hero-banner-section"
      id="hero"
      aria-label="Hero banner section"
      style={{ backgroundImage: `url(${heroBg.src})` }}
    >
      {/* Dynamic ambient backdrop overlay */}
      <div className="hero-gradient-overlay" aria-hidden="true" />
      <div className="hero-glow-sphere" aria-hidden="true" />

      <div className="container h-100 position-relative">
        <div className="row align-items-center h-100 gy-5">
          {/* ── LEFT COLUMN: Text Content & Search Form ── */}
          <div className="col-lg-7 hero-content-left">
            {/* Top Badge */}
            <div className="hero-guarantee-badge">
              <span className="hero-badge-sparkle" aria-hidden="true">
                ✨
              </span>
              #1 Job Portal in 2026 — 50,000+ Active Jobs
            </div>

            {/* Main Heading */}
            <h1 className="hero-main-heading">
              Join Millions. Find Your
              <br />
              Better <span className="hero-heading-blue">Dream Job.</span>
            </h1>

            {/* Sub-heading */}
            <p className="hero-sub-heading">
              Smart AI matching. Direct company applications. Verified recruiters.
            </p>

            {/* Trust pills */}
            <div className="hero-trust-pills" role="list">
              <div className="trust-pill" role="listitem">
                <i className="bi bi-shield-check pill-icon" aria-hidden="true" />
                100% Verified Listings
              </div>
              <div className="trust-pill" role="listitem">
                <i className="bi bi-building pill-icon" aria-hidden="true" />
                10k+ Top Companies
              </div>
              <div className="trust-pill" role="listitem">
                <i className="bi bi-rocket-takeoff pill-icon" aria-hidden="true" />
                Instant Match & Apply
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
                  {/* Designation */}
                  <div className="hero-search-field">
                    <label className="hero-search-label" htmlFor="hero-designation">
                      Designation
                    </label>
                    <div className="hero-input-wrap">
                      <i className="bi bi-briefcase hero-field-icon" aria-hidden="true" />
                      <select
                        id="hero-designation"
                        className="hero-search-input hero-select-field"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        aria-label="Designation"
                      >
                        <option value="">Select Designation</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Marketing Manager">Marketing Manager</option>
                        <option value="Data Analyst">Data Analyst</option>
                      </select>
                      <i
                        className="bi bi-chevron-down hero-field-arrow"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="hero-field-sep" aria-hidden="true" />

                  {/* Experience */}
                  <div className="hero-search-field">
                    <label
                      className="hero-search-label"
                      htmlFor="hero-experience"
                    >
                      Experience
                    </label>
                    <div className="hero-input-wrap">
                      <i className="bi bi-clock-history hero-field-icon" aria-hidden="true" />
                      <select
                        id="hero-experience"
                        className="hero-search-input hero-select-field"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        aria-label="Experience"
                      >
                        <option value="">Select Experience</option>
                        <option value="Freshers">Freshers</option>
                        <option value="1-2 Years">1-2 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-10 Years">5-10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                      </select>
                      <i
                        className="bi bi-chevron-down hero-field-arrow"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className="hero-field-sep" aria-hidden="true" />

                  {/* Location */}
                  <div className="hero-search-field">
                    <label
                      className="hero-search-label"
                      htmlFor="hero-location"
                    >
                      Location
                    </label>
                    <div className="hero-input-wrap">
                      <i className="bi bi-geo-alt hero-field-icon" aria-hidden="true" />
                      <select
                        id="hero-location"
                        className="hero-search-input hero-select-field"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        aria-label="Location"
                      >
                        <option value="">Select Location</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Remote">Remote</option>
                      </select>
                      <i
                        className="bi bi-chevron-down hero-field-arrow"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="hero-search-btn"
                    id="hero-search-submit"
                    aria-label="Search jobs"
                  >
                    <i className="bi bi-search" aria-hidden="true" />
                    <span>Search Jobs</span>
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
                    onClick={() => {
                      setDesignation(term);
                      router.push(`/jobs?keyword=${encodeURIComponent(term)}`);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Glassmorphic Visual Showcase Stack ── */}
          <div className="col-lg-5 hero-showcase-col">
            <div className="hero-showcase-wrapper">

              {/* Top Floating Badge */}
              <div className="hero-float-badge float-badge-top">
                <div className="avatar-stack" aria-hidden="true">
                  <span className="avatar-pill bg-primary text-white">JD</span>
                  <span className="avatar-pill bg-success text-white">SK</span>
                  <span className="avatar-pill bg-purple text-white">+99</span>
                </div>
                <div className="badge-text-group">
                  <span className="badge-title">1,500+ Hired Today</span>
                  <span className="badge-subtitle">Top Startups & MNCs</span>
                </div>
              </div>

              {/* Main Feature Card */}
              <div className="hero-main-card">
                <div className="card-header-badge">
                  <span className="live-dot" /> Live Match Highlight
                </div>

                <div className="card-job-info">
                  <div className="company-logo-circle">
                    <span>JN</span>
                  </div>
                  <div className="company-details">
                    <h3 className="job-title">Senior Lead Product Designer</h3>
                    <p className="company-name">
                      JobNest Tech • <span className="text-primary">Verified Enterprise</span>
                    </p>
                  </div>
                </div>

                <div className="card-tags-row">
                  <span className="card-tag">Full-Time</span>
                  <span className="card-tag">Remote</span>
                  <span className="card-tag salary-tag">₹18L - ₹26L / yr</span>
                </div>

                <div className="match-score-box">
                  <div className="match-score-header">
                    <span className="match-label"><i className="bi bi-cpu" /> Profile Compatibility</span>
                    <span className="match-percent">98% Match</span>
                  </div>
                  <div className="match-progress-bar">
                    <div className="match-progress-fill" style={{ width: "98%" }} />
                  </div>
                </div>

                <button
                  className="card-quick-apply-btn"
                  onClick={() => router.push("/jobs")}
                >
                  <i className="bi bi-lightning-charge-fill" /> Quick Apply
                </button>
              </div>

              {/* Bottom Floating Badge */}
              <div className="hero-float-badge float-badge-bottom">
                <div className="icon-circle bg-success-soft">
                  <i className="bi bi-check-circle-fill text-success" />
                </div>
                <div className="badge-text-group">
                  <span className="badge-title">Direct Recruiter Access</span>
                  <span className="badge-subtitle">Zero Spam • 100% Free</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
