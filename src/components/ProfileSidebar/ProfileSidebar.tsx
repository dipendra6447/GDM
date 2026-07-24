"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import "./ProfileSidebar.css";

const ProfileSidebar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  
  if (!isLoggedIn || !user) return null;

  const getUserInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getRoleLabel = () => {
    if (user?.roles?.includes(2)) return "Employer";
    if (user?.roles?.includes(3)) return "Business Promoter";
    return "Job Seeker";
  };

  const username = user?.email?.split('@')[0];

  return (
    <div className="profile-sidebar-card">
      {/* 1. Profile Section */}
      <div className="profile-sidebar-top text-center mb-4">
        <div className="profile-progress-container mb-3 d-inline-block">
          <div className="profile-progress-wrapper" style={{ position: 'relative', width: '90px', height: '90px' }}>
            <svg width="90" height="90" viewBox="0 0 76 76">
              <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
              <circle cx="38" cy="38" r="32" fill="none" stroke="#14B87A" strokeWidth="4"
                strokeDasharray={201}
                strokeDashoffset={201 * (1 - (user?.profileCompletion || 0) / 100)}
                strokeLinecap="round"
                transform="rotate(-90 38 38)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="profile-avatar-inner" style={{
              position: 'absolute',
              top: '9px',
              left: '9px',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F1F5F9'
            }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: 'var(--color-text-dark)', fontWeight: 'bold', fontSize: '24px' }}>
                  {getUserInitial()}
                </div>
              )}
            </div>
          </div>
          <div className="profile-percent-label">
            {user?.profileCompletion || 0}%
          </div>
        </div>

        <h3 className="profile-name">{username}</h3>
        <p className="profile-role">{getRoleLabel()}</p>
        <span className="profile-updated">Last updated 1d ago</span>

        <Link href="/profile" className="btn-complete-profile mt-3 w-100">
          Complete profile
        </Link>
      </div>

      {/* 2. Profile Performance Box */}
      <div className="profile-performance-box mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="perf-title">Profile performance</span>
          <i className="bi bi-info-circle perf-info-icon" />
        </div>
        <div className="row g-2 text-center mb-3">
          <div className="col-6 border-end" style={{ borderColor: '#E2E8F0' }}>
            <span className="perf-metric-label">Search appearances</span>
            <div className="perf-metric-val">
              1655<span className="metric-dot"></span>
            </div>
          </div>
          <div className="col-6">
            <span className="perf-metric-label">Recruiter actions</span>
            <div className="perf-metric-val">
              87<span className="metric-dot"></span>
            </div>
          </div>
        </div>
        <Link href="/subscription-light" className="perf-boost-link d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge-fill text-warning" />
            Get 3X boost to your profile
          </span>
          <i className="bi bi-chevron-right" />
        </Link>
      </div>

      {/* 3. Links Menu Section */}
      <div className="profile-sidebar-links">
        <Link href="/" className="sidebar-link-item active">
          <i className="bi bi-house-door" />
          <span>My home</span>
        </Link>
        <Link href="/jobs" className="sidebar-link-item">
          <i className="bi bi-briefcase" />
          <span>Jobs</span>
        </Link>
        <Link href="/#discover" className="sidebar-link-item">
          <i className="bi bi-building" />
          <span>Companies</span>
        </Link>
        <Link href="/#blog" className="sidebar-link-item">
          <i className="bi bi-gear" />
          <span>Services</span>
        </Link>
      </div>
    </div>
  );
};

export default ProfileSidebar;
