"use client";
import React from 'react';
import './HiringBanner.css';
import hiringBg from '../../assets/images/hiring_banner_bg.png';

const HiringBanner: React.FC = () => {
  return (
    <section
      className="hiring-banner"
      id="hiring"
      aria-label="Hiring CTA Banner"
    >
      {/* Full-width background image */}
      <img
        src={hiringBg.src}
        alt=""
        className="hiring-bg-img"
        aria-hidden="true"
        loading="lazy"
      />

      {/* Dark blue overlay */}
      <div className="hiring-overlay" aria-hidden="true" />

      {/* Left blue accent bar */}
      <div className="hiring-accent-bar" aria-hidden="true" />

      {/* Content */}
      <div className="hiring-inner container">
        {/* LEFT — text */}
        <div className="hiring-left">
          <h2 className="hiring-title">
            Start Hiring Your Top Talent's Here!
          </h2>
          <p className="hiring-subtext">
            Congue malesuada nascetur felis aliquam mattis, porttitor felis a pharetra sed malesuada.
          </p>
        </div>

        {/* RIGHT — CTA buttons */}
        <div className="hiring-right">
          <a
            href="#"
            className="hiring-btn-primary"
            id="hiring-browse-btn"
            aria-label="Browse jobs as employer"
          >
            Browser Job <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </a>
          <a
            href="#"
            className="hiring-btn-outline"
            id="hiring-browse-outline-btn"
            aria-label="Browse jobs listing"
          >
            Browser Job <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HiringBanner;
