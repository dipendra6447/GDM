"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Logo from '../Logo/Logo';
import '../Navbar/Navbar.css';

interface ActiveSubscriptionInfo {
  type: string;
  tier: string;
  badgeLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  badgeTextColor: string;
  glowColor: string;
}

export default function DashboardTopHeader() {
  const { user, activeRole, switchRole, logout } = useAuth();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<ActiveSubscriptionInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) {
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
      .catch((err) => {
        console.error('Error checking user subscription in DashboardTopHeader:', err);
        setActiveSub(null);
      });
  }, [user, activeRole]);

  if (!user) return null;

  const getInitial = () => user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = (user as any)?.name || user?.email?.split('@')[0] || 'Michael';

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="dashboard-topbar">
      {/* 1. Left: GoDiscoverMe Logo */}
      <div className="dash-topbar-left">
        <Link href="/dashboard" className="d-flex align-items-center text-decoration-none">
          <Logo size={28} />
        </Link>
      </div>

      {/* 2. Center: Search Bar with Location and Search Button matching Mockup */}
      <div className="dash-topbar-center">
        <div className="dash-topbar-search-box">
          <i className="bi bi-search search-icon" />
          <input
            type="text"
            placeholder="Search jobs, people, businesses, services, or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            aria-label="Search GoDiscoverMe"
          />
          <div className="dash-topbar-location-pill">
            <i className="bi bi-geo-alt-fill text-primary me-1" />
            <span>Dayton, OH</span>
          </div>
          <button
            type="button"
            className="dash-topbar-search-btn"
            onClick={handleSearch}
            aria-label="Submit search"
          >
            <i className="bi bi-search" />
          </button>
        </div>
      </div>

      {/* 3. Right: Notifications, Messages, Sub Badge & Profile */}
      <div className="dash-topbar-right">
        {/* Notifications Icon with Badge (3) */}
        <button
          type="button"
          className="dash-icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <i className="bi bi-bell-fill" />
          <span className="dash-icon-badge">3</span>
        </button>

        {/* Messages Icon with Badge (2) */}
        <Link
          href="/dashboard/messages"
          className="dash-icon-btn"
          aria-label="Messages"
          title="Messages"
        >
          <i className="bi bi-chat-dots-fill" />
          <span className="dash-icon-badge">2</span>
        </Link>

        {/* Subscription Status or Premium Button */}
        {activeSub ? (
          <Link
            href={activeRole === 2 ? "/employer/post-job?tab=subscription" : "/dashboard/subscription"}
            className="btn-get-premium nav-sub-badge-btn"
            id="dash-header-sub-badge-btn"
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
            href="/subscription"
            className="btn-get-premium"
            id="dash-header-get-premium-btn"
          >
            <i className="bi bi-star-fill" style={{ fontSize: '12px' }} />
            Get Premium
          </Link>
        )}

        {/* User Profile Dropdown */}
        <div className="nav-profile-wrapper position-relative" ref={dropdownRef}>
          <button
            className="dash-user-dropdown-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            type="button"
            aria-label="Open profile menu"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Profile"
                className="dash-topbar-avatar"
              />
            ) : (
              <img
                src="/images/dashboard_user_michael.jpg"
                alt="Michael"
                className="dash-topbar-avatar"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <span className="dash-topbar-name">{displayName}</span>
            <i className={`bi bi-chevron-${profileDropdownOpen ? 'up' : 'down'} text-muted ms-1`} style={{ fontSize: '11px' }} />
          </button>

          {profileDropdownOpen && (
            <div className="nav-profile-dropdown" style={{ right: 0, top: '48px' }}>
              {/* User Header Info */}
              <div className="nav-dropdown-header">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Profile" className="nav-dropdown-avatar" />
                ) : (
                  <div className="nav-dropdown-initial">{getInitial()}</div>
                )}
                <div className="nav-dropdown-info">
                  <span className="nav-dropdown-email">{user?.email}</span>
                  <span className="nav-dropdown-role">
                    {activeRole === 2 ? 'Employer' : activeRole === 3 ? 'Business Promoter' : 'Job Seeker'}
                  </span>
                </div>
              </div>

              <div className="nav-dropdown-divider" />

              <Link
                href={`/profile?tab=${activeRole}`}
                className="nav-dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <i className="bi bi-person-gear text-primary"></i> Profile Settings
              </Link>

              <Link
                href={`/dashboard/subscription?role=${activeRole}`}
                className="nav-dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <i className="bi bi-credit-card-fill text-primary"></i> My Subscription
              </Link>

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
                            background: activeRole === 1 ? '#2454FF' : '#1e293b',
                            color: activeRole === 1 ? '#ffffff' : '#94a3b8',
                            border: activeRole === 1 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            switchRole(1);
                          }}
                        >
                          <span><i className="bi bi-search me-2"></i>Job Seeker</span>
                          {activeRole === 1 && <i className="bi bi-check-circle-fill ms-2 text-white"></i>}
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
                            background: activeRole === 2 ? '#2454FF' : '#1e293b',
                            color: activeRole === 2 ? '#ffffff' : '#94a3b8',
                            border: activeRole === 2 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            switchRole(2);
                          }}
                        >
                          <span><i className="bi bi-building me-2"></i>Employer</span>
                          {activeRole === 2 && <i className="bi bi-check-circle-fill ms-2 text-white"></i>}
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
                            background: activeRole === 3 ? '#2454FF' : '#1e293b',
                            color: activeRole === 3 ? '#ffffff' : '#94a3b8',
                            border: activeRole === 3 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            switchRole(3);
                          }}
                        >
                          <span><i className="bi bi-megaphone me-2"></i>Business Promoter</span>
                          {activeRole === 3 && <i className="bi bi-check-circle-fill ms-2 text-white"></i>}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="nav-dropdown-divider" />
              <button
                className="nav-dropdown-item nav-dropdown-logout"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                type="button"
              >
                <i className="bi bi-box-arrow-right"></i> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
