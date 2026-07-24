"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardTopHeader() {
  const { user, activeRole, switchRole, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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

      <div className="position-relative" ref={dropdownRef}>
        <button 
          className="dashboard-profile-btn border-0 d-flex align-items-center gap-2"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          type="button"
          style={{ background: '#ffffff', padding: '6px 16px 6px 6px', borderRadius: '99px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}
        >
          {user?.avatarUrl ? (
             <img src={user.avatarUrl} alt="Avatar" className="dash-avatar" />
          ) : (
             <div className="dash-avatar">{getInitial()}</div>
          )}
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{user?.email?.split('@')[0]}</span>
          <i className={`bi bi-chevron-${profileDropdownOpen ? 'up' : 'down'} text-secondary ms-1`} style={{ fontSize: '0.8rem' }}></i>
        </button>

        {profileDropdownOpen && (
          <div 
            className="position-absolute end-0 mt-2 p-3 shadow-lg"
            style={{
              width: '270px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              zIndex: 1050,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)'
            }}
          >
            {/* User Header Info */}
            <div className="d-flex align-items-center gap-3 mb-3 p-2" style={{ background: '#f8fafc', borderRadius: '12px' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="dash-avatar" style={{ width: '40px', height: '40px' }} />
              ) : (
                <div className="dash-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>{getInitial()}</div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {activeRole === 2 ? 'Employer' : activeRole === 3 ? 'Business Promoter' : 'Job Seeker'}
                </div>
              </div>
            </div>

            <div className="dropdown-divider my-2" style={{ borderColor: '#f1f5f9' }} />

            <Link 
              href={`/profile?tab=${activeRole}`}
              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded text-dark"
              style={{ fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
              onClick={() => setProfileDropdownOpen(false)}
            >
              <i className="bi bi-person-gear text-primary"></i> Profile Settings
            </Link>

            <Link 
              href={`/dashboard/subscription?role=${activeRole}`}
              className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded text-dark"
              style={{ fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
              onClick={() => setProfileDropdownOpen(false)}
            >
              <i className="bi bi-credit-card-fill text-primary"></i> My Subscription
            </Link>

            {/* Multi-Role Switcher Section */}
            {user?.roles && user.roles.length > 1 && (
              <>
                <div className="dropdown-divider my-2" style={{ borderColor: '#f1f5f9' }} />
                <div className="py-1">
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

            <div className="dropdown-divider my-2" style={{ borderColor: '#f1f5f9' }} />

            <button
              className="btn btn-sm w-100 text-start d-flex align-items-center gap-2 py-2 px-3 text-danger border-0 bg-transparent"
              style={{ fontSize: '0.875rem', fontWeight: 600 }}
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
  );
}
