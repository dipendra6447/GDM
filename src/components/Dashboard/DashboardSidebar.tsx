"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  activeRole?: number;
}

const DashboardSidebar: React.FC<Props> = ({ activeRole = 1 }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isEmployer = activeRole === 2;
  const isJobSeeker = activeRole === 1;
  const isBusinessPromoter = activeRole === 3;

  const navItems = [
    { label: 'Dashboard', icon: 'bi-grid-fill', href: `/dashboard?role=${activeRole}` },
    ...(isEmployer ? [
      { label: 'Manage Jobs', icon: 'bi-briefcase-fill', href: '/dashboard?role=2&tab=jobs' },
      { label: 'Post a Job', icon: 'bi-plus-circle-fill', href: '/dashboard?role=2&tab=post' },
      { label: 'My Subscription', icon: 'bi-credit-card-fill', href: '/dashboard/subscription?role=2' }
    ] : []),
    ...(isJobSeeker ? [
      { label: 'Applied', icon: 'bi-file-earmark-text-fill', href: '/dashboard/applied' },
      { label: 'Saved Jobs', icon: 'bi-bookmark-fill', href: '/dashboard/saved' },
      { label: 'Saved Searches', icon: 'bi-search', href: '/dashboard/saved-searches' },
      { label: 'My Subscription', icon: 'bi-credit-card-fill', href: '/dashboard/subscription?role=1' }
    ] : []),
    ...(isBusinessPromoter ? [
      { label: 'My Subscription', icon: 'bi-credit-card-fill', href: '/dashboard/subscription?role=3' }
    ] : []),
    { label: 'Community', icon: 'bi-people-fill', href: '/dashboard/community' },
    { label: 'Message', icon: 'bi-chat-dots-fill', href: '/dashboard/messages' },
    { label: 'Profile Settings', icon: 'bi-person-gear', href: `/profile?tab=${activeRole}` },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <Link href="/">
          <span className="logo-icon"><i className="bi bi-briefcase-fill"></i></span>
          <span className="logo-text">JobNest</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const pathOnly = item.href.split('?')[0];
          const isActive = pathname === pathOnly;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <i className="bi bi-box-arrow-left"></i>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
