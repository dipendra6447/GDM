"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import RoleUpgradeModal from '../RoleUpgradeModal/RoleUpgradeModal';
import './MarketplaceHeader.css';

const MarketplaceHeader: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('keyword') || '');
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Auth state from Navbar
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<1 | 2 | 3 | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeSub, setActiveSub] = useState<{
    type: string;
    tier: string;
    badgeLabel: string;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeBg: string;
    badgeTextColor: string;
    glowColor: string;
  } | null>(null);
  
  const { user, isLoading, isLoggedIn, activeRole, switchRole, logout } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      setActiveSub(null);
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/subscriptions/my', { headers, credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const now = new Date();
          const activeSubs = data.data.filter(
            (s: any) => s.status === 'active' && new Date(s.expiresAt) > now
          );
          if (activeSubs.length > 0) {
            let sub = activeSubs.find(
              (s: any) =>
                (activeRole === 1 && s.subscriptionType === 'job_seeker') ||
                (activeRole === 2 && s.subscriptionType === 'job_poster') ||
                (activeRole === 3 && s.subscriptionType === 'business_promoter')
            );
            if (!sub) sub = activeSubs[0];

            const type = sub.subscriptionType;
            const tierStr = sub.tier ? sub.tier.toUpperCase() : '';

            if (type === 'job_seeker') {
              setActiveSub({
                type,
                tier: sub.tier,
                badgeLabel: tierStr ? `✨ SEEKER ${tierStr}` : '✨ SEEKER PRO',
                color: '#D4AF37',
                bgColor: 'rgba(212, 175, 55, 0.1)',
                borderColor: '#D4AF37',
                badgeBg: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                badgeTextColor: '#000000',
                glowColor: 'rgba(212, 175, 55, 0.4)',
              });
            } else if (type === 'job_poster') {
              setActiveSub({
                type,
                tier: sub.tier,
                badgeLabel: tierStr ? `✨ EMPLOYER ${tierStr}` : '✨ EMPLOYER PRO',
                color: '#3B82F6',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3B82F6',
                badgeBg: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                badgeTextColor: '#FFFFFF',
                glowColor: 'rgba(59, 130, 246, 0.4)',
              });
            } else if (type === 'business_promoter') {
              setActiveSub({
                type,
                tier: sub.tier,
                badgeLabel: tierStr ? `✨ PROMOTER ${tierStr}` : '✨ BUSINESS PRO',
                color: '#F59E0B',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                borderColor: '#F59E0B',
                badgeBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
                badgeTextColor: '#000000',
                glowColor: 'rgba(245, 158, 11, 0.4)',
              });
            } else {
              setActiveSub({
                type,
                tier: sub.tier,
                badgeLabel: '✨ PREMIUM',
                color: '#D4AF37',
                bgColor: 'rgba(212, 175, 55, 0.1)',
                borderColor: '#D4AF37',
                badgeBg: 'linear-gradient(135deg, #D4AF37, #B8860B)',
                badgeTextColor: '#000000',
                glowColor: 'rgba(212, 175, 55, 0.4)',
              });
            }
          } else {
            setActiveSub(null);
          }
        } else {
          setActiveSub(null);
        }
      })
      .catch(() => setActiveSub(null));
  }, [isLoggedIn, activeRole]);

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
    setSearchValue(searchParams.get('keyword') || '');
  }, [searchParams]);

  const triggerSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('keyword', searchValue.trim());
    } else {
      params.delete('keyword');
    }
    params.set('page', '1');
    router.push(`/jobs?${params.toString()}`);
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                triggerSearch();
              }
            }}
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
        <button className="mp-search-btn" type="button" id="mp-search-submit" onClick={triggerSearch}>
          Search
        </button>

        {/* Save Search */}
        <button
          className="mp-save-search"
          type="button"
          id="mp-save-search"
          onClick={() => {
            if (!isLoggedIn) {
              router.push('/login');
            } else {
              router.push('/dashboard/saved');
            }
          }}
        >
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

              {/* Golden Get Premium Button before user dropdown */}
              <Link
                href="/subscription"
                className="btn-get-premium"
                id="mp-get-premium-btn"
              >
                <i className="bi bi-star-fill" style={{ fontSize: '12px' }} />
                Get Premium
              </Link>

              <div className="nav-profile-wrapper" ref={dropdownRef}>
                {activeSub && (
                  <span
                    className="nav-sub-badge-top"
                    style={{
                      background: activeSub.badgeBg,
                      color: activeSub.badgeTextColor,
                      boxShadow: `0 2px 10px ${activeSub.glowColor}`,
                      border: '1px solid rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    {activeSub.badgeLabel}
                  </span>
                )}

                <button
                  className="nav-profile-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                  type="button"
                  style={activeSub ? {
                    borderColor: activeSub.borderColor,
                    background: activeSub.bgColor,
                    boxShadow: `0 0 14px ${activeSub.glowColor}`,
                    color: activeSub.color
                  } : undefined}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="nav-profile-avatar"
                      style={activeSub ? { border: `2px solid ${activeSub.color}` } : undefined}
                    />
                  ) : (
                    <div
                      className="nav-profile-initial"
                      style={activeSub ? { background: activeSub.badgeBg, color: activeSub.badgeTextColor } : undefined}
                    >
                      {getUserInitial()}
                    </div>
                  )}
                  <i
                    className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} nav-profile-chevron`}
                    style={activeSub ? { color: activeSub.color } : undefined}
                  />
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
                    <Link href={user?.roles?.includes(2) ? "/employer/post-job?tab=overview" : "/dashboard"} className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
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
                    {/* Multi-Role Switcher Section */}
                    {user?.roles && user.roles.length > 1 && (
                      <>
                        <div className="nav-dropdown-divider" />
                        <div className="px-3 py-2">
                          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                            <i className="bi bi-arrow-repeat me-1"></i> Switch Role
                          </span>
                          <div className="d-flex flex-column gap-1">
                            {user.roles.includes(1) && (
                              <button
                                type="button"
                                className="btn btn-sm d-flex align-items-center justify-content-between w-100"
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  background: activeRole === 1 ? '#2454FF' : '#f8fafc',
                                  color: activeRole === 1 ? '#ffffff' : '#334155',
                                  border: activeRole === 1 ? 'none' : '1px solid #e2e8f0',
                                  transition: 'all 0.15s ease'
                                }}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  switchRole(1);
                                }}
                              >
                                <span><i className="bi bi-search me-2"></i>Job Seeker</span>
                                {activeRole === 1 && <i className="bi bi-check-circle-fill ms-2" style={{ color: '#ffffff' }}></i>}
                              </button>
                            )}
                            {user.roles.includes(2) && (
                              <button
                                type="button"
                                className="btn btn-sm d-flex align-items-center justify-content-between w-100"
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  background: activeRole === 2 ? '#2454FF' : '#f8fafc',
                                  color: activeRole === 2 ? '#ffffff' : '#334155',
                                  border: activeRole === 2 ? 'none' : '1px solid #e2e8f0',
                                  transition: 'all 0.15s ease'
                                }}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  switchRole(2);
                                }}
                              >
                                <span><i className="bi bi-building me-2"></i>Employer</span>
                                {activeRole === 2 && <i className="bi bi-check-circle-fill ms-2" style={{ color: '#ffffff' }}></i>}
                              </button>
                            )}
                            {user.roles.includes(3) && (
                              <button
                                type="button"
                                className="btn btn-sm d-flex align-items-center justify-content-between w-100"
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  background: activeRole === 3 ? '#2454FF' : '#f8fafc',
                                  color: activeRole === 3 ? '#ffffff' : '#334155',
                                  border: activeRole === 3 ? 'none' : '1px solid #e2e8f0',
                                  transition: 'all 0.15s ease'
                                }}
                                onClick={() => {
                                  setDropdownOpen(false);
                                  switchRole(3);
                                }}
                              >
                                <span><i className="bi bi-megaphone me-2"></i>Business Promoter</span>
                                {activeRole === 3 && <i className="bi bi-check-circle-fill ms-2" style={{ color: '#ffffff' }}></i>}
                              </button>
                            )}
                          </div>
                        </div>
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
              <Link href="/register" className="btn-register" style={{ textDecoration: 'none' }}>
                <i className="bi bi-person-plus me-2"></i>
                Register
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
