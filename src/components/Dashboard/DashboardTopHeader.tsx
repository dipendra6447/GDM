"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeSub, setActiveSub] = useState<ActiveSubscriptionInfo | null>(null);
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
      .catch((err) => {
        console.error('Error checking user subscription in DashboardTopHeader:', err);
        setActiveSub(null);
      });
  }, [user, activeRole]);

  if (!user) return null;

  const getInitial = () => user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="dashboard-top-header d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom position-relative">
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
          {activeRole === 2 ? 'Employer Dashboard' : activeRole === 3 ? 'Business Promoter Dashboard' : 'Job Seeker Dashboard'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </p>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Hide Get Premium button if user has active subscription for current role */}
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
            href="/subscription-light"
            className="btn-get-premium"
            id="dash-header-get-premium-btn"
          >
            <i className="bi bi-star-fill" style={{ fontSize: '12px' }} />
            Get Premium
          </Link>
        )}

        <div className="nav-profile-wrapper" ref={dropdownRef}>
          <button 
            className="nav-profile-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
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
                 {getInitial()}
               </div>
            )}
            <i className={`bi bi-chevron-${profileDropdownOpen ? 'up' : 'down'} nav-profile-chevron`} style={activeSub ? { color: activeSub.color } : undefined}></i>
          </button>

          {profileDropdownOpen && (
            <div className="nav-profile-dropdown">
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
                            background: activeRole === 1 ? '#2454FF' : '#f8fafc',
                            color: activeRole === 1 ? '#ffffff' : '#334155',
                            border: activeRole === 1 ? 'none' : '1px solid #e2e8f0',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
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
                            setProfileDropdownOpen(false);
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
                            setProfileDropdownOpen(false);
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
    </div>
  );
}
