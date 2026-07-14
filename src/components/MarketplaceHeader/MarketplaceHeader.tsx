"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import RoleUpgradeModal from '../RoleUpgradeModal/RoleUpgradeModal';
import './MarketplaceHeader.css';

const MarketplaceHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Auth state from Navbar
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<1 | 2 | 3 | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleActionClick = (role: 1 | 2 | 3) => {
    if (!isLoggedIn) {
      const roleStr = role === 2 ? 'job_poster' : role === 3 ? 'business_promoter' : 'job_seeker';
      router.push(`/login?role=${roleStr}`);
      return;
    }
    if (user?.roles?.includes(role)) {
      router.push(`/profile?tab=${role}`);
      return;
    }
    setTargetRole(role);
    setModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getRoleLabel = () => {
    if (user?.roles?.includes(2)) return "Employer";
    if (user?.roles?.includes(3)) return "Business Promoter";
    return "Job Seeker";
  };

  return (
    <header
      className={`mp-header ${scrolled ? 'mp-header-scrolled' : ''}`}
      role="banner"
      id="marketplace-header"
    >
      <div className="mp-header-inner">
        {/* Logo */}
        <Link className="navbar-brand" href="/" aria-label="JobNest Home" style={{ textDecoration: 'none', marginRight: '16px' }}>
          <div className="logo-mark" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="logo-icon" style={{ background: 'var(--color-primary)', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              <i className="bi bi-briefcase-fill"></i>
            </span>
            <span className="logo-text" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-navy)', letterSpacing: '-0.5px' }}>
              Job<span className="logo-accent" style={{ color: 'var(--color-primary)' }}>Nest</span>
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className={`mp-search-wrapper ${searchFocused ? 'mp-search-focused' : ''}`}>
          <i className="bi bi-search mp-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="mp-search-input"
            placeholder="Search jobs, businesses, services, gigs..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search opportunities"
            id="mp-global-search"
          />
          {searchValue && (
            <button
              className="mp-search-clear"
              onClick={() => setSearchValue('')}
              aria-label="Clear search"
              type="button"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button className="mp-search-btn" type="button" id="mp-search-submit">
          Search
        </button>

        {/* Save Search */}
        <button className="mp-save-search" type="button" id="mp-save-search">
          <i className="bi bi-bookmark" />
          <span>Save Search</span>
        </button>

        {/* Right Actions: Auth from Navbar */}
        <div className="mp-header-actions ms-auto d-flex align-items-center gap-3">
          {isLoading ? (
            <div className="nav-auth-skeleton" style={{ width: '100px', height: '40px', background: '#e2e8f0', borderRadius: '8px' }} />
          ) : isLoggedIn ? (
            <>
              {user?.roles?.includes(2) ? (
                <Link
                  href="/employer/post-job"
                  className="btn-register d-none d-lg-flex"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="bi bi-briefcase me-2"></i>
                  Post a Job
                </Link>
              ) : (
                <button
                  onClick={() => handleActionClick(2)}
                  className="btn-register d-none d-lg-flex"
                >
                  <i className="bi bi-briefcase me-2"></i>
                  Post a Job
                </button>
              )}
              <div className="nav-profile-wrapper" ref={dropdownRef}>
                <button
                  className="nav-profile-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                  type="button"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="nav-profile-avatar"
                    />
                  ) : (
                    <div className="nav-profile-initial">{getUserInitial()}</div>
                  )}
                  <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} nav-profile-chevron`} />
                </button>

                {dropdownOpen && (
                  <div className="nav-profile-dropdown">
                    <div className="nav-dropdown-header">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Profile"
                          className="nav-dropdown-avatar"
                        />
                      ) : (
                        <div className="nav-dropdown-initial">{getUserInitial()}</div>
                      )}
                      <div className="nav-dropdown-info">
                        <span className="nav-dropdown-email">{user?.email}</span>
                        <span className="nav-dropdown-role">{getRoleLabel()}</span>
                      </div>
                    </div>
                    
                    {/* Profile Completion Section */}
                    <div className="nav-dropdown-completion px-3 py-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Profile Completion</span>
                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>{user?.profileCompletion || 0}%</span>
                      </div>
                      <div className="progress" style={{ height: '6px', background: 'rgba(255,255,255,0.1)' }}>
                        <div 
                          className={`progress-bar ${(user?.profileCompletion || 0) < 50 ? 'bg-danger' : (user?.profileCompletion || 0) < 80 ? 'bg-warning' : 'bg-success'}`} 
                          role="progressbar" 
                          style={{ width: `${user?.profileCompletion || 0}%` }}
                          aria-valuenow={user?.profileCompletion || 0} 
                          aria-valuemin={0} 
                          aria-valuemax={100}
                        ></div>
                      </div>
                      {(user?.profileCompletion || 0) < 100 && (
                        <Link 
                          href="/profile"
                          className="btn btn-sm btn-outline-primary w-100 mt-2"
                          style={{ fontSize: '0.8rem', borderRadius: '8px', display: 'inline-block', textAlign: 'center' }}
                          onClick={() => setDropdownOpen(false)}
                        >
                          Complete Profile
                        </Link>
                      )}
                    </div>

                    <div className="nav-dropdown-divider" />
                    <Link href="/dashboard" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-grid-fill" /> Dashboard
                    </Link>
                    {user?.roles?.includes(2) && (
                      <>
                        <Link
                          href="/employer/post-job"
                          className="nav-dropdown-item nav-dropdown-post-job"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-plus-circle" /> Post a Job
                        </Link>
                      </>
                    )}
                    <Link href="/jobs" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-search" /> Find Jobs
                    </Link>
                    <Link href="/subscription" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="bi bi-star" /> Subscription
                    </Link>
                    {user?.roles?.includes(4) && (
                      <>
                        <div className="nav-dropdown-divider" />
                        <a
                          href="http://localhost:5173"
                          className="nav-dropdown-item"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-shield-lock" /> Admin Panel
                        </a>
                      </>
                    )}
                    <div className="nav-dropdown-divider" />
                    <button
                      className="nav-dropdown-item nav-dropdown-logout"
                      onClick={logout}
                      type="button"
                    >
                      <i className="bi bi-box-arrow-right" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-login" style={{ textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link href="/login" className="btn-register" style={{ textDecoration: 'none' }}>
                <i className="bi bi-person-plus me-2"></i>
                Post a Job
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Role Upgrade Modal */}
      <RoleUpgradeModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        targetRole={targetRole} 
      />
    </header>
  );
};

export default MarketplaceHeader;
