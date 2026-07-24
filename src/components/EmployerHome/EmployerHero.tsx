"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./EmployerHero.css";

const EmployerHero: React.FC = () => {
  const [roleQuery, setRoleQuery] = useState("");
  const [experience, setExperience] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/employer/post-job?tab=candidates&q=${encodeURIComponent(roleQuery)}`);
  };

  return (
    <section className="emp-hero-wrapper">
      <div className="emp-hero-bg-glow"></div>
      <div className="emp-hero-bg-glow-2"></div>

      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column: Hero Copy & Search */}
          <div className="col-lg-7">
            <div className="emp-hero-badge">
              <i className="bi bi-stars"></i>
              <span>Enterprise Recruiting Suite</span>
            </div>

            <h1 className="emp-hero-title">
              Hire Top 1% Talent <br />
              <span className="emp-hero-title-accent">Faster & Smarter</span> With JobNest
            </h1>

            <p className="emp-hero-subtitle">
              Connect with 10M+ verified professionals. Post up to 3 jobs free, leverage AI candidate matchmaking, and manage your recruitment pipeline with enterprise tools.
            </p>

            {/* Quick Candidate Search Form */}
            <form className="emp-search-box" onSubmit={handleSearch}>
              <div className="emp-search-input-group">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Job title or skill (e.g. Senior React Developer)"
                  value={roleQuery}
                  onChange={(e) => setRoleQuery(e.target.value)}
                />
              </div>

              <div className="emp-search-input-group" style={{ maxWidth: '180px' }}>
                <i className="bi bi-briefcase"></i>
                <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option value="">Any Experience</option>
                  <option value="entry">0-2 Years</option>
                  <option value="mid">3-5 Years</option>
                  <option value="senior">5+ Years</option>
                </select>
              </div>

              <button type="submit" className="emp-search-btn">
                <span>Find Talent</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </form>

            {/* Hero Quick Actions & CTAs */}
            <div className="d-flex flex-wrap gap-3 mb-4">
              <Link
                href="/employer/post-job?tab=post"
                className="btn btn-warning px-4 py-3 fw-bold d-inline-flex align-items-center gap-2"
                style={{
                  borderRadius: "12px",
                  background: "#D4AF37",
                  borderColor: "#D4AF37",
                  color: "#0A0A0A",
                  boxShadow: "0 8px 20px rgba(212, 175, 55, 0.3)",
                }}
              >
                <i className="bi bi-plus-circle-fill"></i>
                Post a Job Free (3 Left)
              </Link>
              <Link
                href="/subscription-light"
                className="btn btn-outline-light px-4 py-3 fw-semibold d-inline-flex align-items-center gap-2"
                style={{
                  borderRadius: "12px",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <i className="bi bi-crown-fill text-warning"></i>
                View Employer Plans
              </Link>
            </div>

            {/* Key Stats Strip */}
            <div className="emp-hero-stats">
              <div className="emp-stat-item">
                <div className="emp-stat-icon gold">
                  <i className="bi bi-people-fill"></i>
                </div>
                <div className="emp-stat-info">
                  <h5>10M+</h5>
                  <p>Verified Job Seekers</p>
                </div>
              </div>
              <div className="emp-stat-item">
                <div className="emp-stat-icon">
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div className="emp-stat-info">
                  <h5>24 Hours</h5>
                  <p>Avg Time to First Apply</p>
                </div>
              </div>
              <div className="emp-stat-item">
                <div className="emp-stat-icon gold">
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <div className="emp-stat-info">
                  <h5>98%</h5>
                  <p>Hiring Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Candidate Radar & Quick Action Preview */}
          <div className="col-lg-5">
            <div className="emp-hero-card-preview">
              <div className="emp-preview-header">
                <div>
                  <span className="badge bg-warning text-dark mb-1 fw-bold">LIVE TALENT MATCH</span>
                  <h4 className="mb-0 text-white fw-bold fs-5">Active Candidates Near You</h4>
                </div>
                <span className="text-success small d-flex align-items-center gap-1">
                  <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                  Active Now
                </span>
              </div>

              {/* Sample Live Candidate 1 */}
              <div className="emp-preview-candidate">
                <div className="emp-cand-avatar">AK</div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0 text-white fw-bold">Alex K.</h6>
                    <span className="badge bg-success-subtle text-success px-2 py-1">Ready to Hire</span>
                  </div>
                  <p className="text-secondary mb-1 small">Senior Full-Stack Engineer • Ex-Stripe</p>
                  <div className="d-flex gap-1 flex-wrap">
                    <span className="badge bg-dark text-warning border border-warning-subtle" style={{ fontSize: "0.7rem" }}>React</span>
                    <span className="badge bg-dark text-warning border border-warning-subtle" style={{ fontSize: "0.7rem" }}>Node.js</span>
                    <span className="badge bg-dark text-warning border border-warning-subtle" style={{ fontSize: "0.7rem" }}>TypeScript</span>
                  </div>
                </div>
              </div>

              {/* Sample Live Candidate 2 */}
              <div className="emp-preview-candidate">
                <div className="emp-cand-avatar" style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}>SL</div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0 text-white fw-bold">Sophia L.</h6>
                    <span className="badge bg-primary-subtle text-primary px-2 py-1">Open to Offer</span>
                  </div>
                  <p className="text-secondary mb-1 small">Product Designer (UI/UX) • 6 Yrs Exp</p>
                  <div className="d-flex gap-1 flex-wrap">
                    <span className="badge bg-dark text-info border border-info-subtle" style={{ fontSize: "0.7rem" }}>Figma</span>
                    <span className="badge bg-dark text-info border border-info-subtle" style={{ fontSize: "0.7rem" }}>Design System</span>
                  </div>
                </div>
              </div>

              {/* Sample Live Candidate 3 */}
              <div className="emp-preview-candidate">
                <div className="emp-cand-avatar" style={{ background: "linear-gradient(135deg, #f97316, #d4af37)" }}>RM</div>
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="mb-0 text-white fw-bold">Rahul M.</h6>
                    <span className="badge bg-warning-subtle text-warning px-2 py-1">Active Applicant</span>
                  </div>
                  <p className="text-secondary mb-1 small">DevOps & Cloud Engineer • AWS Certified</p>
                  <div className="d-flex gap-1 flex-wrap">
                    <span className="badge bg-dark text-light border border-secondary" style={{ fontSize: "0.7rem" }}>Docker</span>
                    <span className="badge bg-dark text-light border border-secondary" style={{ fontSize: "0.7rem" }}>Kubernetes</span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3 pt-2 border-top border-secondary border-opacity-25">
                <Link href="/employer/post-job?tab=candidates" className="text-warning text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1">
                  View All 10,000+ Candidates <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmployerHero;
