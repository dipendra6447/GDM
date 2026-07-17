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
  const [email, setEmail] = useState("");
  const [email2, setEmail2] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (designation) params.set("keyword", designation);
    if (location) params.set("location", location);
    if (experience) params.set("experience", experience);
    router.push(`/jobs?${params.toString()}`);
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
                  {/* Designation */}
                  <div className="hero-search-field">
                    <label className="hero-search-label" htmlFor="hero-designation">
                      Designation
                    </label>
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

                  <div className="hero-field-sep" aria-hidden="true" />

                  {/* Experience */}
                  <div className="hero-search-field">
                    <label
                      className="hero-search-label"
                      htmlFor="hero-experience"
                    >
                      Experience
                    </label>
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

                  <div className="hero-field-sep" aria-hidden="true" />

                  {/* Location */}
                  <div className="hero-search-field">
                    <label
                      className="hero-search-label"
                      htmlFor="hero-location"
                    >
                      Location
                    </label>
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
