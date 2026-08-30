'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '../Logo/Logo';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-section" id="footer" role="contentinfo">
      {/* ── 1. Top Floating CTA Banner ── */}
      <div className="footer-cta-container">
        <div className="footer-cta-card">
          <div className="footer-cta-left">
            <div className="footer-cta-rocket-icon">
              <i className="bi bi-rocket-takeoff-fill"></i>
            </div>
            <div>
              <h3 className="footer-cta-title">
                Ready to <span className="text-indigo-highlight">Discover What's Next?</span>
              </h3>
              <p className="footer-cta-sub">
                Join thousands of people and businesses growing together on GoDiscoverMe.
              </p>
            </div>
          </div>

          <div className="footer-cta-buttons">
            <Link href="/register" className="btn-cta-primary" id="footer-cta-create-account">
              <i className="bi bi-person-plus-fill"></i>
              <span>Create Free Account</span>
            </Link>
            <Link href="/register?role=business_promoter" className="btn-cta-secondary" id="footer-cta-register-business">
              <i className="bi bi-shop"></i>
              <span>Register Your Business</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Main Footer Body Columns ── */}
      <div className="container footer-main-body">
        <div className="row g-4">
          {/* Brand & Socials Column */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <div className="footer-brand-logo mb-3">
              <Logo size={36} />
            </div>
            <p className="footer-col-brand-text">
              The all-in-one discovery platform connecting people, businesses, and opportunities.
              Find work. Hire talent. Promote. Grow. All in one place.
            </p>

            <div className="footer-stay-connected-title">Stay Connected</div>
            <div className="footer-social-pills">
              <a href="#" className="social-pill-btn" aria-label="Facebook" id="footer-social-facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-pill-btn" aria-label="X / Twitter" id="footer-social-twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="social-pill-btn" aria-label="LinkedIn" id="footer-social-linkedin">
                <i className="bi bi-linkedin"></i>
              </a>
              <a href="#" className="social-pill-btn" aria-label="Instagram" id="footer-social-instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-pill-btn" aria-label="YouTube" id="footer-social-youtube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          {/* Col 2: FOR JOB SEEKERS */}
          <div className="col-lg-2 col-md-4 col-6 mb-4 mb-lg-0">
            <h4 className="footer-col-header col-header-blue">
              <i className="bi bi-briefcase"></i> FOR JOB SEEKERS
            </h4>
            <ul className="footer-link-list">
              <li><Link href="/jobs" className="footer-nav-link">Browse Jobs</Link></li>
              <li><Link href="/jobs" className="footer-nav-link">Job Categories</Link></li>
              <li><Link href="/jobs?workMode=Remote" className="footer-nav-link">Remote Jobs</Link></li>
              <li><Link href="/seeker#companies" className="footer-nav-link">Companies Hiring</Link></li>
              <li><Link href="/#about" className="footer-nav-link">Career Resources</Link></li>
              <li><Link href="/register" className="footer-nav-link">Create Profile</Link></li>
              <li><Link href="/dashboard" className="footer-nav-link">Job Alerts</Link></li>
            </ul>
          </div>

          {/* Col 3: FOR BUSINESSES */}
          <div className="col-lg-2 col-md-4 col-6 mb-4 mb-lg-0">
            <h4 className="footer-col-header col-header-green">
              <i className="bi bi-shop"></i> FOR BUSINESSES
            </h4>
            <ul className="footer-link-list">
              <li><Link href="/employer/post-job?tab=post" className="footer-nav-link">Post a Job</Link></li>
              <li><Link href="/employer#candidates" className="footer-nav-link">Find Candidates</Link></li>
              <li><Link href="/marketplace" className="footer-nav-link">Business Profiles</Link></li>
              <li><Link href="/subscription-light" className="footer-nav-link">Promote Your Business</Link></li>
              <li><Link href="/marketplace" className="footer-nav-link">Services Marketplace</Link></li>
              <li><Link href="/marketplace" className="footer-nav-link">Events & Promotions</Link></li>
              <li><Link href="/subscription-light" className="footer-nav-link">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Col 4: COMPANY */}
          <div className="col-lg-2 col-md-4 col-6 mb-4 mb-lg-0">
            <h4 className="footer-col-header col-header-purple">
              <i className="bi bi-people"></i> COMPANY
            </h4>
            <ul className="footer-link-list">
              <li><Link href="/#about" className="footer-nav-link">About Us</Link></li>
              <li><Link href="/#about" className="footer-nav-link">How It Works</Link></li>
              <li><Link href="/#testimonials" className="footer-nav-link">Success Stories</Link></li>
              <li><Link href="/#blog" className="footer-nav-link">Blog</Link></li>
              <li><Link href="/jobs" className="footer-nav-link">Careers</Link></li>
              <li><Link href="/contact" className="footer-nav-link">Press & Media</Link></li>
              <li><Link href="/contact" className="footer-nav-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 5: SUPPORT */}
          <div className="col-lg-3 col-md-6 col-6">
            <h4 className="footer-col-header col-header-amber">
              <i className="bi bi-question-circle"></i> SUPPORT
            </h4>
            <ul className="footer-link-list">
              <li><Link href="/contact" className="footer-nav-link">Help Center</Link></li>
              <li><Link href="/#faq" className="footer-nav-link">FAQs</Link></li>
              <li><Link href="/terms" className="footer-nav-link">Safety Center</Link></li>
              <li><Link href="/terms" className="footer-nav-link">Community Guidelines</Link></li>
              <li><Link href="/terms" className="footer-nav-link">Terms of Service</Link></li>
              <li><Link href="/terms" className="footer-nav-link">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-nav-link">Accessibility</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Stats Metric Bar ── */}
      <div className="footer-stats-bar">
        <div className="container">
          <div className="footer-stats-grid">
            <div className="footer-stat-card">
              <div className="stat-icon-circle stat-circle-purple">
                <i className="bi bi-people-fill"></i>
              </div>
              <div>
                <div className="stat-number-big">2.4M+</div>
                <div className="stat-label-small">Active Users</div>
              </div>
            </div>

            <div className="footer-stat-card">
              <div className="stat-icon-circle stat-circle-green">
                <i className="bi bi-briefcase-fill"></i>
              </div>
              <div>
                <div className="stat-number-big">85K+</div>
                <div className="stat-label-small">Hiring Companies</div>
              </div>
            </div>

            <div className="footer-stat-card">
              <div className="stat-icon-circle stat-circle-amber">
                <i className="bi bi-file-earmark-text-fill"></i>
              </div>
              <div>
                <div className="stat-number-big">120K+</div>
                <div className="stat-label-small">Open Jobs</div>
              </div>
            </div>

            <div className="footer-stat-card">
              <div className="stat-icon-circle stat-circle-indigo">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div>
                <div className="stat-number-big">98%</div>
                <div className="stat-label-small">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Copyright Bar ── */}
      <div className="footer-bottom-bar">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>© {new Date().getFullYear()} GoDiscoverMe. All rights reserved.</div>

            <div className="secure-badge">
              <i className="bi bi-shield-check"></i>
              <span>Your data is secure with us.</span>
            </div>

            <div className="lang-selector">
              <i className="bi bi-globe"></i>
              <span>English (US)</span>
              <i className="bi bi-chevron-down" style={{ fontSize: '10px' }}></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
