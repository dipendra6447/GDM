"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import Link from 'next/link';
import RoleUpgradeModal from '../RoleUpgradeModal/RoleUpgradeModal';
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<1 | 2 | 3 | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const links = isLoggedIn ? [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/#about" },
    { label: "Find Job", href: "/jobs" },
    { label: "Save jobs", href: "/dashboard/saved" },
    { label: "Pricing", href: "/subscription" },
    { label: "Contact", href: "/#contact" },
  ] : [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/#about" },
    { label: "Pricing", href: "/subscription" },
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

  useEffect(() => {
    if (dropdownOpen && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get('tab') || 'overview');
    }
  }, [dropdownOpen, pathname]);

  const getUserInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getRoleLabel = () => {
    if (user?.roles?.includes(2)) return "Employer";
    if (user?.roles?.includes(3)) return "Business Promoter";
    return "Job Seeker";
  };

  // Determine if logged in as Job Seeker
  const isJobSeeker = isLoggedIn && user?.roles?.includes(1);

  // Drawer links
  const drawerLinks = isLoggedIn ? [
    { label: "Search job", href: "/jobs", icon: "bi-search" },
    { label: "Recomended job", href: "/jobs?recommended=true", icon: "bi-stars" },
    { label: "Save job", href: "/dashboard/saved", icon: "bi-bookmark-heart" },
    { label: "Contact us", href: "/#contact", icon: "bi-envelope" },
    { label: "About us", href: "/#about", icon: "bi-info-circle" },
  ] : [
    { label: "Login", href: "/login", icon: "bi-box-arrow-in-right" },
    { label: "For Employers", href: "/login?role=job_poster", icon: "bi-briefcase" },
    { label: "Search job", href: "/jobs", icon: "bi-search" },
    { label: "Price", href: "/subscription", icon: "bi-tags" },
    { label: "Contact us", href: "/#contact", icon: "bi-envelope" },
    { label: "About us", href: "/#about", icon: "bi-info-circle" },
  ];

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
              <Link className="navbar-brand m-0" href="/" aria-label="JobNest Home">
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

            {/* Show login button if not logged in on mobile */}
            {!isLoggedIn && (
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
            <Link className="navbar-brand" href="/" aria-label="JobNest Home">
              <div className="logo-mark">
                <span className="logo-icon">
                  <i className="bi bi-briefcase-fill"></i>
                </span>
                <span className="logo-text">
                  Job<span className="logo-accent">Nest</span>
                </span>
              </div>
            </Link>

            {/* Nav links */}
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

            {/* CTA Buttons — Auth Aware */}
            <div className="navbar-cta d-flex align-items-center gap-3">
              {isLoading ? (
                <div className="nav-auth-skeleton" />
              ) : isLoggedIn ? (
                /* ── Logged In: Show Profile Dropdown Only ── */
                <div className="nav-profile-wrapper" ref={dropdownRef}>
                  <button
                    className="nav-profile-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="User menu"
                    id="nav-user-menu-btn"
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
                      <Link href="/subscription" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <i className="bi bi-star" /> Subscription
                      </Link>
                      <Link
                        href={user?.roles?.includes(2) ? "/dashboard/subscription?role=2" : user?.roles?.includes(3) ? "/dashboard/subscription?role=3" : "/dashboard/subscription?role=1"}
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
              ) : (
                /* ── Logged Out: Show Login & For Employers ── */
                <>
                  <Link href="/login" className="btn-login" id="nav-login-btn" style={{ textDecoration: 'none' }}>
                    Login
                  </Link>
                  <Link href="/login?role=job_poster" className="btn-register" id="nav-register-btn" style={{ textDecoration: 'none' }}>
                    For Employers
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
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)'
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
