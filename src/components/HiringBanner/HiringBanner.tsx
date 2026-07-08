"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import RoleUpgradeModal from '../RoleUpgradeModal/RoleUpgradeModal';
import './HiringBanner.css';
import hiringBg from '../../assets/images/hiring_banner_bg.png';

const HiringBanner: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<1 | 2 | 3 | null>(null);

  const handleActionClick = (role: 1 | 2 | 3) => {
    if (!isLoggedIn) {
      const roleStr = role === 2 ? 'job_poster' : role === 3 ? 'business_promoter' : 'job_seeker';
      router.push(`/login?role=${roleStr}`);
      return;
    }
    if (user?.roles.includes(role)) {
      router.push(`/profile?tab=${role}`);
      return;
    }
    // Logged in but missing role -> show modal
    setTargetRole(role);
    setModalOpen(true);
  };

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
          <button
            onClick={() => handleActionClick(2)}
            className="hiring-btn-primary"
            id="hiring-browse-btn"
            aria-label="Browse jobs as employer"
          >
            Hire Talent <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </button>
          <button
            onClick={() => handleActionClick(2)}
            className="hiring-btn-outline"
            id="hiring-browse-outline-btn"
            aria-label="Browse jobs listing"
          >
            Hire Talent <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
          </button>
        </div>
      </div>
      
      {/* Role Upgrade Modal */}
      <RoleUpgradeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        targetRole={targetRole} 
      />
    </section>
  );
};

export default HiringBanner;
