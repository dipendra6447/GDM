"use client";
import React, { useState } from 'react';
import './JoinCommunity.css';
import joinBg from '../../assets/images/hiring_banner_bg.png';
import { useAuth } from '../../hooks/useAuth';
import RoleUpgradeModal from '../RoleUpgradeModal/RoleUpgradeModal';

const JoinCommunity: React.FC = () => {
  const { isLoggedIn, user, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<1 | 2 | 3 | null>(null);

  const userRoles = user?.roles ?? [];

  // Hide a button for roles the user already holds (check ALL roles, not just the first)
  const showSeekerBtn   = !isLoggedIn || !userRoles.includes(1);
  const showEmployerBtn = !isLoggedIn || !userRoles.includes(2);
  const showPromoterBtn = !isLoggedIn || !userRoles.includes(3);

  const handleRoleClick = (role: 1 | 2 | 3, loginPath: string) => {
    if (!isLoggedIn) {
      window.location.href = loginPath;
      return;
    }
    // Logged in but doesn't have this role → show upgrade modal
    setTargetRole(role);
    setModalOpen(true);
  };

  return (
    <section
      className="join-community-banner"
      id="join-community"
      aria-label="Join Community CTA Banner"
    >
      <img src={joinBg.src} alt="" className="join-bg-img" aria-hidden="true" loading="lazy" />
      <div className="join-overlay" aria-hidden="true" />
      <div className="join-accent-bar" aria-hidden="true" />

      <div className="join-inner container">
        {/* LEFT — dynamic text */}
        <div className="join-left">
          <h2 className="join-title">
            {isLoggedIn ? 'Explore More on JobNest!' : 'Join the JobNest Community!'}
          </h2>
          <p className="join-subtext">
            {isLoggedIn
              ? 'Browse jobs, hire top talent, or promote your business — all in one place.'
              : "Whether you're looking for your dream job, searching for top-tier talent, or wanting to promote your business, we've got you covered."}
          </p>
        </div>

        {/* RIGHT — CTAs */}
        <div className="join-right">
          <div className="join-cta-group">
            {isLoading ? (
              /* Skeleton loader while auth resolves */
              <>
                <div className="join-btn-skeleton join-btn-skeleton--wide" />
                <div className="join-cta-row">
                  <div className="join-btn-skeleton" />
                  <div className="join-btn-skeleton" />
                </div>
              </>
            ) : (
              <>
                {/* Browse Jobs — always visible for everyone */}
                <a
                  href="/jobs"
                  className="join-btn-primary"
                  style={{ justifyContent: 'center' }}
                  id="join-browse-jobs-btn"
                  aria-label="Browse Jobs"
                >
                  Browse Jobs <i className="bi bi-search ms-2" aria-hidden="true" />
                </a>

                {/* Only show roles the user does NOT currently have */}
                <div className="join-cta-row">
                  {showSeekerBtn && (
                    <button
                      className="join-btn-outline"
                      id="join-seeker-btn"
                      onClick={() => handleRoleClick(1, '/login?role=job_seeker')}
                    >
                      Find a Job <i className="bi bi-person ms-2" aria-hidden="true" />
                    </button>
                  )}
                  {showEmployerBtn && (
                    <button
                      className="join-btn-outline"
                      id="join-employer-btn"
                      onClick={() => handleRoleClick(2, '/login?role=job_poster')}
                    >
                      Hire Talent <i className="bi bi-building ms-2" aria-hidden="true" />
                    </button>
                  )}
                  {showPromoterBtn && (
                    <button
                      className="join-btn-outline"
                      id="join-promoter-btn"
                      onClick={() => handleRoleClick(3, '/login?role=business_promoter')}
                    >
                      Promote Business <i className="bi bi-megaphone ms-2" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RoleUpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetRole={targetRole}
      />
    </section>
  );
};

export default JoinCommunity;
