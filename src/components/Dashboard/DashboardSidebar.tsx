"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  activeRole?: number;
}

const DashboardSidebar: React.FC<Props> = ({ activeRole = 1 }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const isEmployer = activeRole === 2;
  const isJobSeeker = activeRole === 1;
  const isBusinessPromoter = activeRole === 3;

  const currentTab = searchParams.get('tab') || 'overview';

  const isItemActive = (href: string) => {
    const [basePath, query] = href.split('?');
    if (pathname !== basePath) return false;
    if (!query) return !searchParams.has('tab') || currentTab === 'overview';
    const urlParams = new URLSearchParams(query);
    return urlParams.get('tab') === currentTab;
  };

  const navItems = [
    ...(isEmployer ? [
      { label: 'Overview', icon: 'bi-grid-fill', href: '/dashboard?tab=overview' },
      { label: 'Manage Jobs', icon: 'bi-briefcase-fill', href: '/dashboard?tab=jobs' },
      { label: 'Post a Job', icon: 'bi-plus-circle-fill', href: '/dashboard?tab=post' },
      { label: 'Search Candidates', icon: 'bi-people-fill', href: '/dashboard?tab=candidates' },
      { label: 'My Subscription', icon: 'bi-credit-card-fill', href: '/dashboard?tab=subscription' }
    ] : []),
    ...(isJobSeeker ? [
      { label: 'Overview', icon: 'bi-grid-fill', href: '/dashboard' },
      { label: 'Applied Jobs', icon: 'bi-file-earmark-text-fill', href: '/dashboard/applied' },
      { label: 'Saved Jobs', icon: 'bi-bookmark-fill', href: '/dashboard/saved' },
      { label: 'Saved Searches', icon: 'bi-search', href: '/dashboard/saved-searches' },
      { label: 'My Subscription', icon: 'bi-credit-card-fill', href: '/dashboard/subscription?role=1' }
    ] : []),
    ...(isBusinessPromoter ? [
      { label: 'Overview', icon: 'bi-grid-fill', href: '/dashboard?tab=overview' },
      { label: 'My Campaigns', icon: 'bi-megaphone-fill', href: '/dashboard?tab=campaigns' },
      { label: 'Analytics', icon: 'bi-graph-up-arrow', href: '/dashboard?tab=analytics' },
      { label: 'My Subscription', icon: 'bi-credit-card-fill', href: '/dashboard/subscription?role=3' }
    ] : []),
    { label: 'Community', icon: 'bi-people-fill', href: '/dashboard/community' },
    { label: 'Messages', icon: 'bi-chat-dots-fill', href: '/dashboard/messages' },
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
          const active = isItemActive(item.href);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
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
