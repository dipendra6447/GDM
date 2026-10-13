"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import './Dashboard.css';

interface Props {
  activeRole?: number;
}

const DashboardSidebar: React.FC<Props> = ({ activeRole = 1 }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const isEmployer = activeRole === 2;
  const isBusinessPromoter = activeRole === 3;
  const currentTab = searchParams.get('tab') || 'overview';

  const navItems = [
    {
      label: 'Dashboard',
      icon: 'bi-grid-fill',
      href: '/dashboard',
      active: pathname === '/dashboard' && (!searchParams.has('tab') || currentTab === 'overview'),
    },
    {
      label: 'Discover',
      icon: 'bi-compass',
      href: '/dashboard/community',
      active: pathname.includes('/community'),
    },
    {
      label: 'Jobs',
      icon: 'bi-briefcase-fill',
      href: isEmployer ? '/dashboard?tab=jobs' : '/dashboard/applied',
      active: isEmployer ? currentTab === 'jobs' : pathname.includes('/applied'),
    },
    {
      label: 'People',
      icon: 'bi-people-fill',
      href: isEmployer ? '/dashboard?tab=candidates' : '/dashboard/community',
      active: isEmployer ? currentTab === 'candidates' : false,
    },
    {
      label: 'Businesses',
      icon: 'bi-shop',
      href: isBusinessPromoter ? '/dashboard?tab=campaigns' : '/dashboard',
      active: isBusinessPromoter ? currentTab === 'campaigns' : false,
    },
    {
      label: 'Services',
      icon: 'bi-tools',
      href: '/services',
      active: pathname.includes('/services'),
    },
    {
      label: 'Events',
      icon: 'bi-calendar-event',
      href: '/events',
      active: pathname.includes('/events'),
    },
    {
      label: 'Messages',
      icon: 'bi-chat-dots-fill',
      href: '/dashboard/messages',
      badge: 2,
      active: pathname.includes('/messages'),
    },
    {
      label: 'Saved',
      icon: 'bi-bookmark-fill',
      href: '/dashboard/saved',
      active: pathname.includes('/saved'),
    },
    {
      label: 'My Profile',
      icon: 'bi-person-circle',
      href: `/profile?tab=${activeRole}`,
      active: pathname.includes('/profile'),
    },
    {
      label: 'Promote',
      icon: 'bi-megaphone-fill',
      href: isBusinessPromoter ? '/dashboard?tab=campaigns' : '/subscription',
      active: isBusinessPromoter && currentTab === 'campaigns',
    },
    {
      label: 'Subscription',
      icon: 'bi-credit-card-fill',
      href: `/dashboard/subscription?role=${activeRole}`,
      active: pathname.includes('/subscription'),
    },
    {
      label: 'Settings',
      icon: 'bi-gear-fill',
      href: `/profile?tab=${activeRole}`,
      active: false,
    },
  ];

  return (
    <aside className="dashboard-sidebar">
      {/* Navigation Links matching mockup */}
      <nav className="sidebar-nav-container">
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`sidebar-nav-link ${item.active ? 'active' : ''}`}
                id={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="sidebar-nav-link-left">
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="sidebar-item-badge">{item.badge}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Upgrade for More Visibility Card matching mockup */}
      <div className="sidebar-bottom-block">
        <div className="sidebar-upgrade-card">
          <div className="upgrade-crown-icon">👑</div>
          <h4 className="upgrade-title">Upgrade for More Visibility</h4>
          <p className="upgrade-desc">Get discovered by more people and opportunities.</p>
          <Link href="/subscription" className="upgrade-btn" id="sidebar-upgrade-btn">
            View Plans →
          </Link>
        </div>

        {/* Log Out button */}
        <button className="sidebar-logout-btn" onClick={logout} id="sidebar-logout-btn">
          <i className="bi bi-box-arrow-left" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
