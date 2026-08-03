"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./Hero.css";
import heroBg from "../../assets/images/hero_city_bg.png";

const popularSearches = [
  "Web Developer",
  "Marketing Manager",
  "UI/UX Designer",
  "Data Analyst",
  "Sales Executive",
  "Graphic Designer",
];

const Hero: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "companies" | "candidates">("jobs");
  const [keyword, setKeyword] = useState("");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (designation) params.set("designation", designation);
    if (location) params.set("location", location);
    if (experience) params.set("experience", experience);

    if (activeTab === "companies") {
      router.push(`/companies?${params.toString()}`);
    } else if (activeTab === "candidates") {
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
      style={{ backgroundImage: `url(${heroBg.src})` }}
    >
      {/* Dark overlay for maximum text contrast */}
      <div className="hero-dark-overlay" aria-hidden="true" />

      <div className="container position-relative hero-content-container">
        {/* ── CENTERED HERO HEADING ── */}
        <div className="text-center hero-header-group">
          <h1 className="hero-main-heading">
            Find the Right Job.
            <br />
            Build Your <span className="hero-heading-blue">Future.</span>
          </h1>

          <p className="hero-sub-heading">
            Smart tools. Real opportunities. Trusted by millions.
          </p>
        </div>

        {/* ── SEARCH CARD CONTAINER ── */}
        <div className="hero-search-card-wrapper">
          {/* Top Pill Tab Switcher */}
          <div className="hero-tabs-nav" role="tablist" aria-label="Search category tabs">
            <button
              className={`hero-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
              onClick={() => setActiveTab("jobs")}
              role="tab"
              aria-selected={activeTab === "jobs"}
            >
              <i className="bi bi-search hero-tab-icon" aria-hidden="true" />
              <span>Find Jobs</span>
            </button>
            <button
              className={`hero-tab-btn ${activeTab === "companies" ? "active" : ""}`}
              onClick={() => setActiveTab("companies")}
              role="tab"
              aria-selected={activeTab === "companies"}
            >
              <i className="bi bi-building hero-tab-icon" aria-hidden="true" />
              <span>Find Companies</span>
            </button>
            <button
              className={`hero-tab-btn ${activeTab === "candidates" ? "active" : ""}`}
              onClick={() => setActiveTab("candidates")}
              role="tab"
              aria-selected={activeTab === "candidates"}
            >
              <i className="bi bi-people hero-tab-icon" aria-hidden="true" />
              <span>Find Candidates</span>
            </button>
          </div>

          {/* White Main Search Card */}
          <div className="hero-main-search-card">
            <form onSubmit={handleSearch} role="search" aria-label="Job search form">
              <div className="hero-search-fields-grid">
                {/* Field 1: Keyword */}
                <div className="hero-field-cell">
                  <div className="hero-field-icon-badge icon-badge-blue">
                    <i className="bi bi-briefcase" aria-hidden="true" />
                  </div>
                  <div className="hero-field-content">
                    <label className="hero-field-label" htmlFor="hero-keyword">
                      Job Title or Keyword
                    </label>
                    <input
                      id="hero-keyword"
                      type="text"
                      className="hero-field-input"
                      placeholder="e.g. UI/UX Designer"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="hero-cell-divider" aria-hidden="true" />

                {/* Field 2: Designation */}
                <div className="hero-field-cell">
                  <div className="hero-field-icon-badge icon-badge-green">
                    <i className="bi bi-building" aria-hidden="true" />
                  </div>
                  <div className="hero-field-content">
                    <label className="hero-field-label" htmlFor="hero-designation">
                      Designation
                    </label>
                    <div className="hero-select-wrap">
                      <select
                        id="hero-designation"
                        className="hero-field-select"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      >
                        <option value="">Select designation</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Marketing Manager">Marketing Manager</option>
                        <option value="Data Analyst">Data Analyst</option>
                      </select>
                      <i className="bi bi-chevron-down hero-select-chevron" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="hero-cell-divider" aria-hidden="true" />

                {/* Field 3: Location */}
                <div className="hero-field-cell">
                  <div className="hero-field-icon-badge icon-badge-purple">
                    <i className="bi bi-geo-alt" aria-hidden="true" />
                  </div>
                  <div className="hero-field-content">
                    <label className="hero-field-label" htmlFor="hero-location">
                      Location
                    </label>
                    <div className="hero-select-wrap">
                      <select
                        id="hero-location"
                        className="hero-field-select"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      >
                        <option value="">City, State or Remote</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Remote">Remote</option>
                      </select>
                      <i className="bi bi-chevron-down hero-select-chevron" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="hero-cell-divider" aria-hidden="true" />

                {/* Field 4: Experience */}
                <div className="hero-field-cell">
                  <div className="hero-field-icon-badge icon-badge-amber">
                    <i className="bi bi-clock-history" aria-hidden="true" />
                  </div>
                  <div className="hero-field-content">
                    <label className="hero-field-label" htmlFor="hero-experience">
                      Experience
                    </label>
                    <div className="hero-select-wrap">
                      <select
                        id="hero-experience"
                        className="hero-field-select"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      >
                        <option value="">Select experience</option>
                        <option value="Freshers">Freshers</option>
                        <option value="1-2 Years">1-2 Years</option>
                        <option value="3-5 Years">3-5 Years</option>
                        <option value="5-10 Years">5-10 Years</option>
                        <option value="10+ Years">10+ Years</option>
                      </select>
                      <i className="bi bi-chevron-down hero-select-chevron" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Submit Search Button */}
                <button type="submit" className="hero-submit-btn" id="hero-search-submit">
                  <i className="bi bi-search" aria-hidden="true" />
                  <span>Search Jobs</span>
                </button>
              </div>
            </form>

            {/* Popular Searches Row */}
            <div className="hero-popular-searches-bar">
              <div className="popular-tags-group">
                <span className="popular-label">Popular Searches:</span>
                <div className="popular-pills-list">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="popular-pill-btn"
                      onClick={() => {
                        setKeyword(term);
                        router.push(`/jobs?keyword=${encodeURIComponent(term)}`);
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="browse-all-link"
                onClick={() => router.push("/jobs")}
              >
                Browse All <i className="bi bi-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS METRICS ROW AT BOTTOM ── */}
        <div className="hero-stats-row" role="list">
          <div className="hero-stat-card" role="listitem">
            <div className="stat-badge badge-blue">
              <i className="bi bi-people-fill" aria-hidden="true" />
            </div>
            <div className="stat-text">
              <h4 className="stat-number">10M+</h4>
              <p className="stat-desc">Active Job Seekers</p>
            </div>
          </div>

          <div className="hero-stat-card" role="listitem">
            <div className="stat-badge badge-green">
              <i className="bi bi-briefcase-fill" aria-hidden="true" />
            </div>
            <div className="stat-text">
              <h4 className="stat-number">250K+</h4>
              <p className="stat-desc">Companies Hiring</p>
            </div>
          </div>

          <div className="hero-stat-card" role="listitem">
            <div className="stat-badge badge-purple">
              <i className="bi bi-shield-check" aria-hidden="true" />
            </div>
            <div className="stat-text">
              <h4 className="stat-number">100%</h4>
              <p className="stat-desc">Verified Jobs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
