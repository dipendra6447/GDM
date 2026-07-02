"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import './LeftSidebar.css';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'bi-grid' },
  { key: 'discover', label: 'Discover', icon: 'bi-compass' },
  { key: 'jobs', label: 'Jobs', icon: 'bi-briefcase' },
  { key: 'gigs', label: 'Gigs', icon: 'bi-lightning' },
  { key: 'businesses', label: 'Businesses', icon: 'bi-building' },
  { key: 'services', label: 'Services', icon: 'bi-tools' },
  { key: 'events', label: 'Events', icon: 'bi-calendar-event' },
];

const activityNav: NavItem[] = [
  { key: 'applications', label: 'Applications', icon: 'bi-file-earmark-text' },
  { key: 'saved-items', label: 'Saved Items', icon: 'bi-bookmark' },
  { key: 'messages', label: 'Messages', icon: 'bi-chat-dots', badge: 3 },
  { key: 'notifications', label: 'Notifications', icon: 'bi-bell', badge: 7 },
];

const listingsNav: NavItem[] = [
  { key: 'manage-listings', label: 'Manage Listings', icon: 'bi-list-check' },
  { key: 'add-listing', label: 'Add New Listing', icon: 'bi-plus-circle' },
  { key: 'bookings', label: 'Bookings / Leads', icon: 'bi-calendar-check' },
];

interface LeftSidebarProps {
  activeItem?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeItem = 'discover',
  mobileOpen = false,
  onMobileClose,
}) => {
  const [activityOpen, setActivityOpen] = useState(true);
  const [listingsOpen, setListingsOpen] = useState(true);
  const { user } = useAuth();
  const profileCompletion = user?.profileCompletion || 0;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="ls-overlay"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`ls-sidebar ${mobileOpen ? 'ls-sidebar-open' : ''}`}
        aria-label="Main sidebar navigation"
        id="left-sidebar"
      >
        {/* Logo */}
        <div className="ls-logo-area">
          <Link href="/" className="ls-logo" aria-label="JobNest Home">
            <span className="ls-logo-icon">
              <i className="bi bi-briefcase-fill" />
            </span>
            <span className="ls-logo-text">
              Job<span className="ls-logo-accent">Nest</span>
              <small className="ls-logo-tagline">.com</small>
            </span>
          </Link>
          {/* Mobile close */}
          <button
            className="ls-close-btn"
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="ls-scroll">
          {/* Main Nav */}
          <nav className="ls-nav-section">
            {mainNav.map((item) => (
              <a
                key={item.key}
                href="#"
                className={`ls-nav-item ${activeItem === item.key ? 'ls-nav-active' : ''}`}
                id={`ls-nav-${item.key}`}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* My Activity */}
          <div className="ls-nav-group">
            <button
              className="ls-group-toggle"
              type="button"
              onClick={() => setActivityOpen(!activityOpen)}
              aria-expanded={activityOpen}
            >
              <span>My Activity</span>
              <i className={`bi bi-chevron-${activityOpen ? 'up' : 'down'}`} />
            </button>
            {activityOpen && (
              <nav className="ls-group-items">
                {activityNav.map((item) => (
                  <a
                    key={item.key}
                    href="#"
                    className={`ls-nav-item ${activeItem === item.key ? 'ls-nav-active' : ''}`}
                    id={`ls-nav-${item.key}`}
                  >
                    <i className={`bi ${item.icon}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ls-nav-badge">{item.badge}</span>
                    )}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* My Listings */}
          <div className="ls-nav-group">
            <button
              className="ls-group-toggle"
              type="button"
              onClick={() => setListingsOpen(!listingsOpen)}
              aria-expanded={listingsOpen}
            >
              <span>My Listings</span>
              <i className={`bi bi-chevron-${listingsOpen ? 'up' : 'down'}`} />
            </button>
            {listingsOpen && (
              <nav className="ls-group-items">
                {listingsNav.map((item) => (
                  <a
                    key={item.key}
                    href="#"
                    className={`ls-nav-item ${activeItem === item.key ? 'ls-nav-active' : ''}`}
                    id={`ls-nav-${item.key}`}
                  >
                    <i className={`bi ${item.icon}`} />
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Saved Searches */}
          <nav className="ls-nav-section ls-nav-bottom-section">
            <a href="#" className="ls-nav-item" id="ls-nav-saved-searches">
              <i className="bi bi-search" />
              <span>Saved Searches</span>
            </a>
          </nav>

          {/* Profile Completion Card */}
          <div className="ls-profile-card">
            <div className="ls-profile-card-header">
              <div className="ls-profile-progress-ring">
                <svg viewBox="0 0 36 36" className="ls-ring-svg">
                  <path
                    className="ls-ring-bg"
                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  />
                  <path
                    className="ls-ring-fill"
                    strokeDasharray={`${profileCompletion}, 100`}
                    d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  />
                  <text x="18" y="20.5" className="ls-ring-text">{profileCompletion}%</text>
                </svg>
              </div>
              <div className="ls-profile-card-text">
                <h4 className="ls-profile-card-title">Get Discovered!</h4>
                <p className="ls-profile-card-desc">
                  Complete your profile to increase your visibility and unlock new opportunities.
                </p>
              </div>
            </div>
            <Link 
              href="/profile"
              className="ls-profile-card-cta w-100 text-start" 
              id="ls-complete-profile"
              style={{ border: 'none', background: 'transparent' }}
            >
              Complete Profile <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>

        {/* Bottom: Switch Account */}
        <div className="ls-bottom">
          <a href="#" className="ls-switch-account" id="ls-switch-account">
            <div className="ls-switch-icon">
              <i className="bi bi-person-circle" />
            </div>
            <div className="ls-switch-text">
              <span className="ls-switch-label">Switch Account</span>
              <span className="ls-switch-sub">Personal Account</span>
            </div>
            <i className="bi bi-chevron-right ls-switch-chevron" />
          </a>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;
