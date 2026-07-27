"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import Link from 'next/link';
import RoleUpgradeModal from '../RoleUpgradeModal/RoleUpgradeModal';
import "./Navbar.css";

interface NavbarProps {
  variant?: 'default' | 'minimal';
}

const Navbar: React.FC<NavbarProps> = ({ variant = 'default' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
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
  const router = useRouter();
  const pathname = usePathname();

  const logoHref = isLoggedIn ? (activeRole === 2 ? '/employer' : activeRole === 3 ? '/dashboard' : '/seeker') : '/';

  const links = isLoggedIn ? (
    activeRole === 2 ? [
      { label: "Employer Home", href: "/employer" },
      { label: "Post a Job", href: "/employer/post-job?tab=post" },
      { label: "Manage Jobs", href: "/employer/post-job?tab=jobs" },
      { label: "Find Candidates", href: "/employer#candidates" },
      { label: "Pricing", href: "/subscription-light" },
      { label: "Contact", href: "/#contact" },
    ] : activeRole === 3 && !user?.roles?.includes(1) && !user?.roles?.includes(2) ? [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/subscription-light" },
      { label: "Contact", href: "/#contact" },
    ] : [
      { label: "Home", href: "/seeker" },
      { label: "About Us", href: "/#about" },
      { label: "Find Job", href: "/jobs" },
      { label: "Save jobs", href: "/dashboard/saved" },
      { label: "Pricing", href: "/subscription-light" },
      { label: "Contact", href: "/#contact" },
    ]
  ) : [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/subscription-light" },
    { label: "About Us", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  // Ensure profile dropdown is strictly closed on navigation or auth state change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname, isLoggedIn]);

  useEffect(() => {
    if (dropdownOpen && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get('tab') || 'overview');
    }
  }, [dropdownOpen, pathname]);

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
            const targetType =
              activeRole === 2 ? 'job_poster' :
              activeRole === 3 ? 'business_promoter' :
              'job_seeker';

            const sub = activeSubs.find((s: any) => s.subscriptionType === targetType);

            if (sub) {
              const type = sub.subscriptionType;
              const rawTier = (sub.tier || '').toLowerCase();
              
              let badgeLabel = '✨ GOLD';
              let color = '#D4AF37';
              let bgColor = 'rgba(212, 175, 55, 0.1)';
              let borderColor = '#D4AF37';
              let badgeBg = 'linear-gradient(135deg, #D4AF37, #B8860B)';
              let badgeTextColor = '#000000';
              let glowColor = 'rgba(212, 175, 55, 0.4)';

              if (rawTier.includes('platinum') || rawTier.includes('monthly') || rawTier === 'platinum') {
                badgeLabel = '✨ PLATINUM';
                color = '#38BDF8';
                bgColor = 'rgba(56, 189, 248, 0.1)';
                borderColor = '#38BDF8';
                badgeBg = 'linear-gradient(135deg, #38BDF8, #1E40AF)';
                badgeTextColor = '#FFFFFF';
                glowColor = 'rgba(56, 189, 248, 0.4)';
              } else if (rawTier.includes('silver') || rawTier.includes('daily') || rawTier === 'silver') {
                badgeLabel = '✨ SILVER';
                color = '#C0C0C0';
                bgColor = 'rgba(192, 192, 192, 0.1)';
                borderColor = '#C0C0C0';
                badgeBg = 'linear-gradient(135deg, #E0E0E0, #808080)';
                badgeTextColor = '#000000';
                glowColor = 'rgba(192, 192, 192, 0.4)';
              } else {
                badgeLabel = '✨ GOLD';
                color = '#D4AF37';
                bgColor = 'rgba(212, 175, 55, 0.1)';
                borderColor = '#D4AF37';
                badgeBg = 'linear-gradient(135deg, #D4AF37, #B8860B)';
                badgeTextColor = '#000000';
                glowColor = 'rgba(212, 175, 55, 0.4)';
              }

              setActiveSub({
                type,
                tier: sub.tier,
                badgeLabel,
                color,
                bgColor,
                borderColor,
                badgeBg,
                badgeTextColor,
                glowColor,
              });
            } else {
              setActiveSub(null);
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

  const getUserInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getRoleLabel = () => {
    if (activeRole === 2) return "Employer";
    if (activeRole === 3) return "Business Promoter";
    return "Job Seeker";
  };

  // Determine if logged in as Job Seeker
  const isJobSeeker = isLoggedIn && activeRole === 1;

  // Drawer links
  const drawerLinks = isLoggedIn ? (
    activeRole === 2 ? [
      { label: "Employer Home", href: "/employer", icon: "bi-building" },
      { label: "Post a Job", href: "/dashboard?tab=post", icon: "bi-plus-circle" },
      { label: "Manage Jobs", href: "/dashboard?tab=jobs", icon: "bi-briefcase" },
      { label: "Candidate Search", href: "/dashboard?tab=candidates", icon: "bi-people" },
      { label: "Employer Dashboard", href: "/dashboard?tab=overview", icon: "bi-grid" },
      { label: "Pricing", href: "/subscription-light", icon: "bi-tags" },
      { label: "Contact us", href: "/#contact", icon: "bi-envelope" },
    ] : activeRole === 3 && !user?.roles?.includes(1) && !user?.roles?.includes(2) ? [
      { label: "Dashboard", href: "/dashboard", icon: "bi-grid" },
      { label: "Pricing", href: "/subscription-light", icon: "bi-tags" },
      { label: "Contact us", href: "/#contact", icon: "bi-envelope" },
    ] : [
      { label: "Job Seeker Home", href: "/seeker", icon: "bi-house" },
      { label: "Search job", href: "/jobs", icon: "bi-search" },
      { label: "Recomended job", href: "/jobs?recommended=true", icon: "bi-stars" },
      { label: "Save job", href: "/dashboard/saved", icon: "bi-bookmark-heart" },
      { label: "Contact us", href: "/#contact", icon: "bi-envelope" },
      { label: "About us", href: "/#about", icon: "bi-info-circle" },
    ]
  ) : [
    { label: "Home", href: "/", icon: "bi-house" },
    { label: "Login", href: "/login", icon: "bi-box-arrow-in-right" },
    { label: "Register", href: "/register", icon: "bi-person-plus" },
    { label: "Search job", href: "/jobs", icon: "bi-search" },
    { label: "Price", href: "/subscription-light", icon: "bi-tags" },
    { label: "Contact us", href: "/#contact", icon: "bi-envelope" },
    { label: "About us", href: "/#about", icon: "bi-info-circle" },
  ];

  if (pathname.startsWith('/jobs') || pathname === '/marketplace') {
    return null;
  }

  return (
    <header
      className={`navbar-wrapper ${scrolled ? "navbar-scrolled" : ""}`}
      role="banner"
    >
      <nav
        className="navbar navbar-expand-lg"
        aria-label="Main navigation"
        id="main-navbar"
      >
        <div className="container">
          {/* ── MOBILE NAV HEADER (Visible on lg and down screens) ── */}
          <div className="d-flex d-lg-none align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">
              <button
                className="custom-toggler"
                onClick={() => setMenuOpen(true)}
                type="button"
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
              <Link className="navbar-brand m-0" href={logoHref} aria-label="JobNest Home">
                <div className="logo-mark">
                  <span className="logo-icon">
                    <i className="bi bi-briefcase-fill"></i>
                  </span>
                  <span className="logo-text">
                    Job<span className="logo-accent">Nest</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Show Get Premium or Login on mobile */}
            {isLoggedIn ? (
              !activeSub && (
                <Link
                  href="/subscription-light"
                  className="btn-get-premium"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <i className="bi bi-star-fill" style={{ fontSize: '10px' }} />
                  Get Premium
                </Link>
              )
            ) : (
              <Link
                href="/login"
                className="btn-register"
                style={{ fontSize: '14px', borderRadius: '8px', border: '1px solid rgba(36, 84, 255, 0.3)', textDecoration: 'none', color: 'var(--color-primary)' }}
              >
                Login
              </Link>
            )}
          </div>

          {/* ── DESKTOP NAV HEADER (Visible on lg and up screens) ── */}
          <div className="d-none d-lg-flex align-items-center justify-content-between w-100">
            {/* Logo */}
            <Link className="navbar-brand" href={logoHref} aria-label="JobNest Home">
              <div className="logo-mark">
                <span className="logo-icon">
                  <i className="bi bi-briefcase-fill"></i>
                </span>
                <span className="logo-text">
                  Job<span className="logo-accent">Nest</span>
                </span>
              </div>
            </Link>

            {/* Nav links (hidden in minimal mode) */}
            {variant !== 'minimal' && (
              <ul className="navbar-nav mx-auto mb-2 mb-lg-0 nav-links flex-row gap-3">
                {links.map((link) => (
                  <li className="nav-item" key={link.label}>
                    <Link
                      className="nav-link"
                      href={link.href}
                      id={`nav-${link.label.toLowerCase().replace(" ", "-")}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA Buttons — Auth Aware */}
            <div className="navbar-cta d-flex align-items-center gap-3">
              {isLoading ? (
                <div className="nav-auth-skeleton" />
              ) : isLoggedIn ? (
                /* ── Logged In: Show Golden Button (Get Premium / Active Subscription Badge) + Profile Dropdown ── */
                <>
                  {activeSub ? (
                    <Link
                      href={activeRole === 2 ? "/employer/post-job?tab=subscription" : "/dashboard/subscription"}
                      className="btn-get-premium nav-sub-badge-btn"
                      id="nav-sub-badge-btn"
                      style={{
                        background: activeSub.badgeBg,
                        color: '#FFFFFF',
                        borderColor: activeSub.borderColor,
                        boxShadow: `0 4px 15px ${activeSub.glowColor}`
                      }}
                    >
                      {activeSub.badgeLabel}
                    </Link>
                  ) : (
                    <Link
                      href="/subscription-light"
                      className="btn-get-premium"
                      id="nav-get-premium-btn"
                    >
                      <i className="bi bi-star-fill" style={{ fontSize: '12px' }} />
                      Get Premium
                    </Link>
                  )}

                  <div className="nav-profile-wrapper" ref={dropdownRef}>
                    <button
                      className="nav-profile-btn"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-label="User menu"
                      id="nav-user-menu-btn"
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
                        <Link
                          href={user?.roles?.includes(1) ? "/dashboard" : user?.roles?.includes(2) ? "/employer/post-job?tab=overview" : "/dashboard"}
                          className={`nav-dropdown-item ${(user?.roles?.includes(1) && pathname === '/dashboard') ||
                            (!user?.roles?.includes(1) && pathname === '/employer/post-job' && (currentTab === 'overview' || currentTab === 'jobs' || currentTab === 'edit'))
                            ? 'active'
                            : ''
                            }`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-grid-fill" /> Dashboard
                        </Link>
                        {user?.roles?.includes(2) && (
                          <>
                            <Link
                              href="/employer/post-job?tab=post"
                              className={`nav-dropdown-item nav-dropdown-post-job ${pathname === '/employer/post-job' && currentTab === 'post' ? 'active' : ''}`}
                              id="nav-dropdown-post-job"
                              onClick={() => setDropdownOpen(false)}
                            >
                              <i className="bi bi-plus-circle" /> Post a Job
                            </Link>
                          </>
                        )}
                        <Link href="/jobs" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <i className="bi bi-search" /> Find Jobs
                        </Link>
                        <Link href="/subscription-light" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <i className="bi bi-star" /> Subscription
                        </Link>
                        <Link
                          href={user?.roles?.includes(2) ? "/employer/post-job?tab=subscription" : user?.roles?.includes(3) ? "/dashboard/subscription?role=3" : "/dashboard/subscription?role=1"}
                          className="nav-dropdown-item"
                          id="nav-dropdown-my-orders"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <i className="bi bi-receipt" /> My Orders
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
                /* ── Logged Out: Show Login & Register ── */
                <>
                  <Link href="/login" className="btn-login" id="nav-login-btn" style={{ textDecoration: 'none' }}>
                    Login
                  </Link>
                  <Link href="/register" className="btn-register" id="nav-register-btn" style={{ textDecoration: 'none' }}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE DRAWER SIDE MENU ── */}
      {menuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
          }}
        />
      )}
      <div
        className="mobile-drawer"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '300px',
          background: '#0A0A0A',
          borderRight: '1px solid rgba(212,175,55,0.2)',
          zIndex: 100000,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: menuOpen ? '0 0 40px rgba(0,0,0,0.8)' : 'none'
        }}
      >
        {/* Drawer Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="logo-mark">
            <span className="logo-icon" style={{ background: '#D4AF37', color: '#0A0A0A' }}>
              <i className="bi bi-briefcase-fill"></i>
            </span>
            <span className="logo-text" style={{ color: '#FFFFFF' }}>
              Job<span className="logo-accent" style={{ color: '#D4AF37' }}>Nest</span>
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '24px', cursor: 'pointer' }}
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Profile Card for Job Seeker Login */}
        {isLoggedIn && (
          <div className="mobile-menu-profile-header d-flex align-items-center gap-3 mb-4 p-3" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="d-flex flex-column align-items-center">
              <div className="profile-progress-wrapper" style={{ position: 'relative', width: '70px', height: '70px' }}>
                <svg width="70" height="70" viewBox="0 0 76 76">
                  <circle cx="38" cy="38" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <circle cx="38" cy="38" r="32" fill="none" stroke="#D4AF37" strokeWidth="4"
                    strokeDasharray={201}
                    strokeDashoffset={201 * (1 - (user?.profileCompletion || 0) / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 38 38)"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#222'
                }}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                      {getUserInitial()}
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#D4AF37', marginTop: '6px', fontWeight: 600 }}>
                {user?.profileCompletion || 0}% Complete
              </span>
            </div>
            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email?.split('@')[0]}
              </span>
              <Link
                href="/profile"
                style={{ fontSize: '12px', color: '#D4AF37', textDecoration: 'none', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}
                onClick={() => setMenuOpen(false)}
              >
                Update profile <i className="bi bi-chevron-right" style={{ fontSize: '10px' }}></i>
              </Link>
            </div>
          </div>
        )}

        {/* Multi-Role Switcher in Mobile Drawer */}
        {isLoggedIn && user?.roles && user.roles.length > 1 && (
          <div className="mobile-role-switcher mb-3 p-3" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <span style={{ fontSize: '11px', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              <i className="bi bi-arrow-repeat me-1"></i> Switch Role
            </span>
            <div className="d-flex flex-column gap-2">
              {user.roles.includes(1) && (
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center justify-content-between w-100"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    background: activeRole === 1 ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                    color: activeRole === 1 ? '#000000' : '#ffffff',
                    border: activeRole === 1 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    switchRole(1);
                  }}
                >
                  <span><i className="bi bi-search me-2"></i>Job Seeker</span>
                  {activeRole === 1 && <i className="bi bi-check-circle-fill ms-2" style={{ color: '#000000' }}></i>}
                </button>
              )}
              {user.roles.includes(2) && (
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center justify-content-between w-100"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    background: activeRole === 2 ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                    color: activeRole === 2 ? '#000000' : '#ffffff',
                    border: activeRole === 2 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    switchRole(2);
                  }}
                >
                  <span><i className="bi bi-building me-2"></i>Employer</span>
                  {activeRole === 2 && <i className="bi bi-check-circle-fill ms-2" style={{ color: '#000000' }}></i>}
                </button>
              )}
              {user.roles.includes(3) && (
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center justify-content-between w-100"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    padding: '8px 12px',
                    background: activeRole === 3 ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                    color: activeRole === 3 ? '#000000' : '#ffffff',
                    border: activeRole === 3 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setMenuOpen(false);
                    switchRole(3);
                  }}
                >
                  <span><i className="bi bi-megaphone me-2"></i>Business Promoter</span>
                  {activeRole === 3 && <i className="bi bi-check-circle-fill ms-2" style={{ color: '#000000' }}></i>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Drawer Links list */}
        <div className="mobile-drawer-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drawerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="d-flex align-items-center gap-3 p-3"
              style={{
                color: '#B0B0B0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.03)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`bi ${link.icon}`} style={{ color: '#D4AF37', fontSize: '18px' }}></i>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Sign Out Button inside drawer */}
        {isLoggedIn && (
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="d-flex align-items-center gap-3 p-3 mt-auto"
            style={{
              color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <i className="bi bi-box-arrow-right" style={{ fontSize: '18px' }}></i>
            <span>Sign Out</span>
          </button>
        )}
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

export default Navbar;
