"use client";
import React from 'react';
import Link from 'next/link';
import './Footer.css';

const footerColumns = [
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Blog', 'Partners', 'Investors'],
  },
  {
    title: 'Job Categories',
    links: ['Technology', 'Design', 'Marketing', 'Finance', 'Healthcare', 'Engineering'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'],
  },
  {
    title: 'Top Countries',
    links: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Singapore'],
  },
];

const socialLinks = [
  { icon: 'bi-twitter-x', label: 'Twitter/X', href: '#' },
  { icon: 'bi-linkedin', label: 'LinkedIn', href: '#' },
  { icon: 'bi-facebook', label: 'Facebook', href: '#' },
  { icon: 'bi-instagram', label: 'Instagram', href: '#' },
  { icon: 'bi-youtube', label: 'YouTube', href: '#' },
];

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="footer" role="contentinfo">
      <div className="footer-top">
        <div className="container">
          <div className="row g-5">
            {/* Brand Column */}
            <div className="col-lg-3 col-md-6">
              <div className="footer-brand">
                <div className="footer-logo">
                  <span className="footer-logo-icon">
                    <i className="bi bi-briefcase-fill"></i>
                  </span>
                  <span className="footer-logo-text">Job<span>Nest</span></span>
                </div>
                <p className="footer-brand-text">
                  The world's leading premium job marketplace. Connecting top talent with exceptional opportunities since 2020.
                </p>

                {/* Social Links */}
                <div className="footer-social d-flex gap-3 mt-4">
                  {socialLinks.map(social => (
                    <Link
                      key={social.label}
                      href={social.href}
                      className="social-btn"
                      aria-label={social.label}
                      id={`social-${social.label.toLowerCase()}`}
                    >
                      <i className={`bi ${social.icon}`}></i>
                    </Link>
                  ))}
                </div>

                {/* App Badges */}
                <div className="footer-apps d-flex flex-wrap gap-2 mt-4">
                  <Link href="#" className="app-badge" id="footer-app-store">
                    <i className="bi bi-apple me-2"></i>
                    <div>
                      <span className="app-badge-small">Download on the</span>
                      <span className="app-badge-big">App Store</span>
                    </div>
                  </Link>
                  <Link href="#" className="app-badge" id="footer-play-store">
                    <i className="bi bi-google-play me-2"></i>
                    <div>
                      <span className="app-badge-small">Get it on</span>
                      <span className="app-badge-big">Google Play</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Link Columns */}
            {footerColumns.map(col => (
              <div className="col-lg-2 col-md-6 col-sm-6" key={col.title}>
                <div className="footer-column">
                  <h4 className="footer-column-title">{col.title}</h4>
                  <ul className="footer-links">
                    {col.links.map(link => (
                      <li key={link}>
                        <Link href="#" className="footer-link" id={`footer-link-${link.toLowerCase().replace(/\s+/g, '-')}`}>
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <p className="footer-copyright">
              © 2024 JobNest. All rights reserved. Made with ❤️ for job seekers worldwide.
            </p>
            <div className="footer-bottom-links d-flex gap-4">
              <Link href="#" className="footer-bottom-link" id="footer-privacy">Privacy</Link>
              <Link href="#" className="footer-bottom-link" id="footer-terms">Terms</Link>
              <Link href="#" className="footer-bottom-link" id="footer-cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
